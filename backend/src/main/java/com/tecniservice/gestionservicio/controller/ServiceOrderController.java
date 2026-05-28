package com.tecniservice.gestionservicio.controller;

import com.tecniservice.gestionservicio.model.Evidence;
import com.tecniservice.gestionservicio.model.ServiceOrder;
import com.tecniservice.gestionservicio.model.ServiceStatus;
import com.tecniservice.gestionservicio.service.ServiceOrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class ServiceOrderController {

    private final ServiceOrderService service;

    public ServiceOrderController(ServiceOrderService service) {
        this.service = service;
    }

    @GetMapping
    public List<ServiceOrder> getAll() {
        return service.getAllOrders();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceOrder> getById(@PathVariable Long id) {
        return service.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ServiceOrder create(@RequestBody ServiceOrder order) {
        return service.createOrder(order);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id, 
            @RequestParam ServiceStatus status,
            @RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(service.updateStatus(id, status, file));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error al guardar la imagen");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/evidence")
    public ResponseEntity<Evidence> uploadEvidence(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(service.addEvidence(id, file));
        } catch (IOException | RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
