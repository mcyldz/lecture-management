package com.mcyldz.service.impl;

import com.mcyldz.common.GeneralException;
import com.mcyldz.enums.Role;
import com.mcyldz.model.User;
import com.mcyldz.repository.IUserRepository;
import com.mcyldz.service.IUserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements IUserService {

    private final IUserRepository userRepository;

    public UserServiceImpl(IUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User save(User user) {

        // Yeni kayıt eklerken veya Update yaparken save metodunu kullanıcaz. Bunu anlamak için id kontrolü yapmamız yeterli.

        if (user.getId() == null) {

            // id null ise 2 tane kontrol yapmamız lazım. ID Unique mi ve geçerli mi diye.
            if (user.getIdentityNo() == null || user.getIdentityNo().length() != 11) {
                throw new GeneralException("Invalid identity no!");
            }
            if (userRepository.existsByIdentityNo(user.getIdentityNo())) {
                throw new GeneralException("Identity no already exists!");
            }
        }
        return userRepository.save(user);
    }

    @Override
    public User getById(Integer id) {
        return userRepository.findById(id).orElseThrow(()-> new GeneralException("User not found"));
    }

    @Override
    public List<User> getAll() {
        return userRepository.findAll();
    }

    @Override
    public Page<User> getAll(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Override
    public void delete(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new GeneralException("User not found");
        }

        userRepository.deleteById(id);
    }

    @Override
    public List<User> getUsersByRole(Role role) {
        return userRepository.findAllByRole(role);
    }

    @Override
    public List<User> getPotentialUsers(List<Integer> ids) {
        if (ids.isEmpty()) {
            return getUsersByRole(Role.STUDENT);
        }

        return userRepository.findAllByRoleAndIdIsNotIn(Role.STUDENT, ids);
    }
}
