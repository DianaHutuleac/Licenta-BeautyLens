package com.skincare.backend.mapper;

import com.skincare.backend.domain.dto.explore.ExploreCommentDto;
import com.skincare.backend.domain.entity.ExploreComment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = "spring")
public interface ExploreCommentMapper {
    @Mapping(source = "user.firstName", target = "userName")
    @Mapping(source = "user.profilePictureUrl", target = "profilePictureUrl")
    ExploreCommentDto toDto(ExploreComment comment);

    List<ExploreCommentDto> toDtoList(List<ExploreComment> comments);
}

