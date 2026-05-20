package com.heartmonitor.service;

import com.heartmonitor.entity.Measurement;
import com.heartmonitor.handler.WebSocketHandler;
import com.heartmonitor.repository.MeasurementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MeasurementService {
    private final MeasurementRepository measurementRepository;
    private final WebSocketHandler webSocketHandler;

    public Measurement saveMeasurement(Measurement measurement) {
        Measurement saved = measurementRepository.save(measurement);

        // Notify doctor via WebSocket if emergency or low heart rate
        if (saved.getStatus().contains("EMERGENCY") || saved.getStatus().contains("LOW")) {
            webSocketHandler.sendAlert(saved);
        }

        return saved;
    }

    public List<Measurement> getAllMeasurements() {
        return measurementRepository.findAllByOrderByTimestampDesc();
    }
    public Optional<Measurement> getMeasurementById(Long id) {
        return measurementRepository.findById(id);
    }
}