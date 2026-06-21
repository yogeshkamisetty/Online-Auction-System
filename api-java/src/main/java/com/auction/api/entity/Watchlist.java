package com.auction.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "\"Watchlist\"", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"userId", "auctionId"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Watchlist {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "userId", nullable = false, insertable = false, updatable = false)
    private String userId;

    @Column(name = "auctionId", nullable = false, insertable = false, updatable = false)
    private String auctionId;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auctionId", nullable = false)
    private Auction auction;
}
