/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createLesson = /* GraphQL */ `
  mutation CreateLesson(
    $input: CreateLessonInput!
    $condition: ModelLessonConditionInput
  ) {
    createLesson(input: $input, condition: $condition) {
      id
      title
      description
      content
      owner
      tags {
        items {
          id
          lessonId
          tagLabel
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
export const updateLesson = /* GraphQL */ `
  mutation UpdateLesson(
    $input: UpdateLessonInput!
    $condition: ModelLessonConditionInput
  ) {
    updateLesson(input: $input, condition: $condition) {
      id
      title
      description
      content
      owner
      tags {
        items {
          id
          lessonId
          tagLabel
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
export const deleteLesson = /* GraphQL */ `
  mutation DeleteLesson(
    $input: DeleteLessonInput!
    $condition: ModelLessonConditionInput
  ) {
    deleteLesson(input: $input, condition: $condition) {
      id
      title
      description
      content
      owner
      tags {
        items {
          id
          lessonId
          tagLabel
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
export const createTag = /* GraphQL */ `
  mutation CreateTag(
    $input: CreateTagInput!
    $condition: ModelTagConditionInput
  ) {
    createTag(input: $input, condition: $condition) {
      label
      lessons {
        items {
          id
          lessonId
          tagLabel
          createdAt
          updatedAt
          owner
        }
        nextToken
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
export const updateTag = /* GraphQL */ `
  mutation UpdateTag(
    $input: UpdateTagInput!
    $condition: ModelTagConditionInput
  ) {
    updateTag(input: $input, condition: $condition) {
      label
      lessons {
        items {
          id
          lessonId
          tagLabel
          createdAt
          updatedAt
          owner
        }
        nextToken
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
export const deleteTag = /* GraphQL */ `
  mutation DeleteTag(
    $input: DeleteTagInput!
    $condition: ModelTagConditionInput
  ) {
    deleteTag(input: $input, condition: $condition) {
      label
      lessons {
        items {
          id
          lessonId
          tagLabel
          createdAt
          updatedAt
          owner
        }
        nextToken
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
export const createLessonTags = /* GraphQL */ `
  mutation CreateLessonTags(
    $input: CreateLessonTagsInput!
    $condition: ModelLessonTagsConditionInput
  ) {
    createLessonTags(input: $input, condition: $condition) {
      id
      lessonId
      tagLabel
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
        label
        lessons {
          nextToken
        }
        createdAt
        updatedAt
        owner
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
export const updateLessonTags = /* GraphQL */ `
  mutation UpdateLessonTags(
    $input: UpdateLessonTagsInput!
    $condition: ModelLessonTagsConditionInput
  ) {
    updateLessonTags(input: $input, condition: $condition) {
      id
      lessonId
      tagLabel
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
        label
        lessons {
          nextToken
        }
        createdAt
        updatedAt
        owner
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
export const deleteLessonTags = /* GraphQL */ `
  mutation DeleteLessonTags(
    $input: DeleteLessonTagsInput!
    $condition: ModelLessonTagsConditionInput
  ) {
    deleteLessonTags(input: $input, condition: $condition) {
      id
      lessonId
      tagLabel
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
        label
        lessons {
          nextToken
        }
        createdAt
        updatedAt
        owner
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
