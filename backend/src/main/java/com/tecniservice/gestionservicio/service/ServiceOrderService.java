package com.tecniservice.gestionservicio.service;

import com.tecniservice.gestionservicio.model.Evidence;
import com.tecniservice.gestionservicio.model.ServiceOrder;
import com.tecniservice.gestionservicio.model.ServiceStatus;
import com.tecniservice.gestionservicio.repository.EvidenceRepository;
import com.tecniservice.gestionservicio.repository.ServiceOrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ServiceOrderService {

    private final ServiceOrderRepository repository;
    private final EvidenceRepository evidenceRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public ServiceOrderService(ServiceOrderRepository repository, EvidenceRepository evidenceRepository) {
        this.repository = repository;
        this.evidenceRepository = evidenceRepository;
    }

    public List<ServiceOrder> getAllOrders() {
        return repository.findAll();
    }

    public Optional<ServiceOrder> getOrderById(Long id) {
        return repository.findById(id);
    }

    public ServiceOrder createOrder(ServiceOrder order) {
        return repository.save(order);
    }

    public ServiceOrder updateStatus(Long id, ServiceStatus newStatus, MultipartFile file) throws IOException {
        ServiceOrder order = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));
        
        // Regla: No se puede regresar al estado anterior
        if (newStatus.ordinal() <= order.getEstadoActual().ordinal()) {
            throw new RuntimeException("No se puede regresar a un estado anterior o igual al actual");
        }

        // Regla: En cada cambio de estado se debe agregar una foto
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Se requiere una foto para cambiar de estado");
        }

        // Guardar la evidencia
        Evidence evidence = addEvidenceInternal(order, file, newStatus);
        
        // Sincronizar la colección para que la respuesta sea completa
        order.getEvidencias().add(evidence);

        order.setEstadoActual(newStatus);
        return repository.save(order);
    }

    public Evidence addEvidence(Long orderId, MultipartFile file) throws IOException {
        ServiceOrder order = repository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));
        Evidence evidence = addEvidenceInternal(order, file, order.getEstadoActual());
        
        // Sincronizar la colección del lado del objeto Java
        order.getEvidencias().add(evidence);
        repository.save(order);
        
        return evidence;
    }

    private Evidence addEvidenceInternal(ServiceOrder order, MultipartFile file, ServiceStatus status) throws IOException {
        Path root = Paths.get(uploadDir);
        if (!Files.exists(root)) {
            Files.createDirectories(root);
        }

        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Files.copy(file.getInputStream(), root.resolve(filename));

        Evidence evidence = new Evidence();
        evidence.setRutaImagen(filename);
        evidence.setServiceOrder(order);
        evidence.setEstado(status);

        return evidenceRepository.save(evidence);
    }
}
