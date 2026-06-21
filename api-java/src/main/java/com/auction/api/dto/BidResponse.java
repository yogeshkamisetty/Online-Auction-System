package com.auction.api.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BidResponse {
    private String id;
    private BigDecimal amount;
    private LocalDateTime createdAt;
    private UserResponse user;
}
