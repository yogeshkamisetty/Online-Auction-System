package com.auction.api.repository;

import com.auction.api.entity.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistRepository extends JpaRepository<Watchlist, String> {
    List<Watchlist> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<Watchlist> findByUserIdAndAuctionId(String userId, String auctionId);
}
