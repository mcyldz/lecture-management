package com.mcyldz.service;

import com.mcyldz.enums.Role;
import com.mcyldz.model.User;

import java.util.List;

//                                      <> içine class'ın kendi tipini verecez artıkın.
public interface IUserService extends IService<User>{

    List<User> getUsersByRole(Role role);

    List<User> getPotentialUsers(List<Integer> ids);
}
