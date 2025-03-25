package com.mcyldz.repository;

import com.mcyldz.enums.Role;
import com.mcyldz.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IUserRepository extends JpaRepository<User, Integer> {

    boolean existsByIdentityNo(String identityNo);

    List<User> findAllByRole(Role role);

    // Verdiğim id'ler dışındaki kullanıcıları bana geri döner.
    List<User> findAllByRoleAndIdIsNotIn(Role role, List<Integer> idList);
}
