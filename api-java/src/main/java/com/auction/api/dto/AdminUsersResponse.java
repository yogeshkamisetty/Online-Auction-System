package com.auction.api.dto;

import com.auction.api.entity.Role;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUsersResponse {
    private List<AdminUserItem> items;
    private long total;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminUserItem {
        private String id;
        private String name;
        private String email;
        private Role role;
        private Boolean suspended;
        private LocalDateTime createdAt;
        private UserCounts count;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserCounts {
        private long auctions;
        private long bids;
    }
}
