package com.tecniservice.gestionservicio.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "service_orders")
public class ServiceOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String clienteNombre;
    private String dispositivo;
    private String descripcionProblema;

    @Enumerated(EnumType.STRING)
    private ServiceStatus estadoActual;

    private LocalDateTime fechaCreacion;

    @OneToMany(mappedBy = "serviceOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Evidence> evidencias = new ArrayList<>();

    public ServiceOrder() {}

    public ServiceOrder(Long id, String clienteNombre, String dispositivo, String descripcionProblema, ServiceStatus estadoActual, LocalDateTime fechaCreacion) {
        this.id = id;
        this.clienteNombre = clienteNombre;
        this.dispositivo = dispositivo;
        this.descripcionProblema = descripcionProblema;
        this.estadoActual = estadoActual;
        this.fechaCreacion = fechaCreacion;
    }

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        if (estadoActual == null) {
            estadoActual = ServiceStatus.RECIBIDO;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }

    public String getDispositivo() { return dispositivo; }
    public void setDispositivo(String dispositivo) { this.dispositivo = dispositivo; }

    public String getDescripcionProblema() { return descripcionProblema; }
    public void setDescripcionProblema(String descripcionProblema) { this.descripcionProblema = descripcionProblema; }

    public ServiceStatus getEstadoActual() { return estadoActual; }
    public void setEstadoActual(ServiceStatus estadoActual) { this.estadoActual = estadoActual; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public List<Evidence> getEvidencias() { return evidencias; }
    public void setEvidencias(List<Evidence> evidencias) { this.evidencias = evidencias; }
}
