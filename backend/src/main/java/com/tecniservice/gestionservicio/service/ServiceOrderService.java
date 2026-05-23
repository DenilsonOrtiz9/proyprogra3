package com.tecniservice.gestionservicio.service;

import com.tecniservice.gestionservicio.model.Evidence;
import com.tecniservice.gestionservicio.model.ServiceOrder;
import com.tecniservice.gestionservicio.model.ServiceStatus;
import com.tecniservice.gestionservicio.repository.EvidenceRepository;
import com.tecniservice.gestionservicio.repository.ServiceOrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
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

    public ServiceOrder updateStatus(Long id, ServiceStatus newStatus) {
        ServiceOrder order = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));
        order.setEstadoActual(newStatus);
        return repository.save(order);
    }

    public Evidence addEvidence(Long orderId, MultipartFile file) throws IOException {
        ServiceOrder order = repository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        Path root = Paths.get(uploadDir);
        if (!Files.exists(root)) {
            Files.createDirectories(root);
        }

        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Files.copy(file.getInputStream(), root.resolve(filename));

        Evidence evidence = new Evidence();
        evidence.setRutaImagen(filename);
        evidence.setServiceOrder(order);

        return evidenceRepository.save(evidence);
    }
}
