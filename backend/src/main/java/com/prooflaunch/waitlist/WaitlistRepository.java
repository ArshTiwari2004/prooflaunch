package com.prooflaunch.waitlist;

import org.springframework.data.jpa.repository.JpaRepository;

public interface WaitlistRepository extends JpaRepository<WaitlistEntry, Long> {

    boolean existsByEmailAndPlan(String email, String plan);
}
