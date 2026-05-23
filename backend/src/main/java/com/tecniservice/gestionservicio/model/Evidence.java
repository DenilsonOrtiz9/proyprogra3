package com.tecniservice.gestionservicio.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "evidences")
public class Evidence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String rutaImagen;
    private LocalDateTime fechaCaptura;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_order_id")
    @JsonIgnore
    private ServiceOrder serviceOrder;

    public Evidence() {}

    public Evidence(Long id, String rutaImagen, LocalDateTime fechaCaptura, ServiceOrder serviceOrder) {
        this.id = id;
        this.rutaImagen = rutaImagen;
        this.fechaCaptura = fechaCaptura;
        this.serviceOrder = serviceOrder;
    }

    @PrePersist
    protected void onCreate() {
        fechaCaptura = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRutaImagen() { return rutaImagen; }
    public void setRutaImagen(String rutaImagen) { this.rutaImagen = rutaImagen; }

    public LocalDateTime getFechaCaptura() { return fechaCaptura; }
    public void setFechaCaptura(LocalDateTime fechaCaptura) { this.fechaCaptura = fechaCaptura; }

    public ServiceOrder getServiceOrder() { return serviceOrder; }
    public void setServiceOrder(ServiceOrder serviceOrder) { this.serviceOrder = serviceOrder; }
}
