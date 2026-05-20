package com.heartmonitor.controller;

import com.heartmonitor.entity.Measurement;
import com.heartmonitor.service.MeasurementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/measurements")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class MeasurementController {
    private final MeasurementService measurementService;

    @PostMapping
    public ResponseEntity<Measurement> createMeasurement(@RequestBody Measurement measurement) {
        Measurement saved = measurementService.saveMeasurement(measurement);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public ResponseEntity<List<Measurement>> getAllMeasurements() {
        return ResponseEntity.ok(measurementService.getAllMeasurements());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Measurement> getMeasurementById(@PathVariable Long id) {
        return measurementService.getMeasurementById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}