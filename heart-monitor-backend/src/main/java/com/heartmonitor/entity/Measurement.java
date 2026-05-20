package com.heartmonitor.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "measurements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Measurement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer bpm;

    @Column(nullable = false)
    private String status; // e.g., "EMERGENCY", "LOW HEART RATE", "HIGH HEART RATE", "NORMAL"

    @Column(nullable = false)
    private String location; // e.g., "9.03,38.74"

    @Column(nullable = false)
    private String mapUrl;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}