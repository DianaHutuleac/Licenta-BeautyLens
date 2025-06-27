package com.skincare.backend.mapper;

import com.skincare.backend.domain.dto.user.UserCreateDto;
import com.skincare.backend.domain.dto.user.UserGetDto;
import com.skincare.backend.domain.entity.UserData;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface UserDataMapper {
    UserDataMapper INSTANCE = Mappers.getMapper(UserDataMapper.class);

    UserGetDto userToUserGetDto(UserData user);

    UserData userCreateDtoToUserData(UserCreateDto userCreateDto);
}
