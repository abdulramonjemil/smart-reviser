/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateLesson = /* GraphQL */ `
  subscription OnCreateLesson(
    $filter: ModelSubscriptionLessonFilterInput
    $owner: String
  ) {
    onCreateLesson(filter: $filter, owner: $owner) {
      id
      title
      description
      content
      owner
      tags {
        items {
          id
          lessonId
          tagId
          createdAt
          updatedAt
          owner
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateLesson = /* GraphQL */ `
  subscription OnUpdateLesson(
    $filter: ModelSubscriptionLessonFilterInput
    $owner: String
  ) {
    onUpdateLesson(filter: $filter, owner: $owner) {
      id
      title
      description
      content
      owner
      tags {
        items {
          id
          lessonId
          tagId
          createdAt
          updatedAt
          owner
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteLesson = /* GraphQL */ `
  subscription OnDeleteLesson(
    $filter: ModelSubscriptionLessonFilterInput
    $owner: String
  ) {
    onDeleteLesson(filter: $filter, owner: $owner) {
      id
      title
      description
      content
      owner
      tags {
        items {
          id
          lessonId
          tagId
          createdAt
          updatedAt
          owner
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const onCreateTag = /* GraphQL */ `
  subscription OnCreateTag(
    $filter: ModelSubscriptionTagFilterInput
    $owner: String
  ) {
    onCreateTag(filter: $filter, owner: $owner) {
      id
      label
      lessons {
        items {
          id
          lessonId
          tagId
          createdAt
          updatedAt
          owner
        }
        nextToken
      }
      owner
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateTag = /* GraphQL */ `
  subscription OnUpdateTag(
    $filter: ModelSubscriptionTagFilterInput
    $owner: String
  ) {
    onUpdateTag(filter: $filter, owner: $owner) {
      id
      label
      lessons {
        items {
          id
          lessonId
          tagId
          createdAt
          updatedAt
          owner
        }
        nextToken
      }
      owner
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteTag = /* GraphQL */ `
  subscription OnDeleteTag(
    $filter: ModelSubscriptionTagFilterInput
    $owner: String
  ) {
    onDeleteTag(filter: $filter, owner: $owner) {
      id
      label
      lessons {
        items {
          id
          lessonId
          tagId
          createdAt
          updatedAt
          owner
        }
        nextToken
      }
      owner
      createdAt
      updatedAt
    }
  }
`;
export const onCreateLessonTags = /* GraphQL */ `
  subscription OnCreateLessonTags(
    $filter: ModelSubscriptionLessonTagsFilterInput
    $owner: String
  ) {
    onCreateLessonTags(filter: $filter, owner: $owner) {
      id
      lessonId
      tagId
      lesson {
        id
        title
        description
        content
        owner
        tags {
          nextToken
        }
        createdAt
        updatedAt
      }
      tag {
        id
        label
        lessons {
          nextToken
        }
        owner
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onUpdateLessonTags = /* GraphQL */ `
  subscription OnUpdateLessonTags(
    $filter: ModelSubscriptionLessonTagsFilterInput
    $owner: String
  ) {
    onUpdateLessonTags(filter: $filter, owner: $owner) {
      id
      lessonId
      tagId
      lesson {
        id
        title
        description
        content
        owner
        tags {
          nextToken
        }
        createdAt
        updatedAt
      }
      tag {
        id
        label
        lessons {
          nextToken
        }
        owner
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onDeleteLessonTags = /* GraphQL */ `
  subscription OnDeleteLessonTags(
    $filter: ModelSubscriptionLessonTagsFilterInput
    $owner: String
  ) {
    onDeleteLessonTags(filter: $filter, owner: $owner) {
      id
      lessonId
      tagId
      lesson {
        id
        title
        description
        content
        owner
        tags {
          nextToken
        }
        createdAt
        updatedAt
      }
      tag {
        id
        label
        lessons {
          nextToken
        }
        owner
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
