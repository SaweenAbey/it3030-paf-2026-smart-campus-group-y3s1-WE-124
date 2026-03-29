package com.example.fullstack_backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.fullstack_backend.model.Role;
import com.example.fullstack_backend.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    List<User> findByIsActive(Boolean isActive);

    List<User> findByRoleAndIsActive(Role role, Boolean isActive);

    List<User> findByRoleInAndIsActive(List<Role> roles, Boolean isActive);

    List<User> findByIdInAndIsActive(List<Long> ids, Boolean isActive);

    List<User> findByDepartment(String department);

    List<User> findByCampusId(String campusId);

    @Modifying
    @Query("UPDATE User u SET u.lastLogin = :lastLogin, u.lastActivity = :lastActivity WHERE u.username = :username")
    void updateLastLogin(@Param("username") String username, 
                        @Param("lastLogin") LocalDateTime lastLogin,
                        @Param("lastActivity") LocalDateTime lastActivity);

    @Modifying
    @Query("UPDATE User u SET u.isActive = :isActive WHERE u.id = :id")
    void updateActiveStatus(@Param("id") Long id, @Param("isActive") Boolean isActive);

    @Query("SELECT u FROM User u WHERE u.name LIKE %:keyword% OR u.username LIKE %:keyword% OR u.email LIKE %:keyword%")
    List<User> searchUsers(@Param("keyword") String keyword);
}
