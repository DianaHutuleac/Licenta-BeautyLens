package com.skincare.backend.mapper;

import com.skincare.backend.domain.dto.explore.ExplorePostDto;
import com.skincare.backend.domain.entity.ExplorePost;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = "spring")
public interface ExplorePostMapper {
    @Mapping(source = "user.firstName", target = "userName")
    @Mapping(source = "user.age", target = "age")
    @Mapping(source = "user.gender", target = "gender")
    @Mapping(source = "user.profilePictureUrl", target = "profilePictureUrl")
    @Mapping(source = "likedBy", target = "likedBy")
    ExplorePostDto toDto(ExplorePost post);

    List<ExplorePostDto> toDtoList(List<ExplorePost> posts);
}
