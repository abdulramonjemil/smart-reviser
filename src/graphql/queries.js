/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getLesson = /* GraphQL */ `
  query GetLesson($id: ID!) {
    getLesson(id: $id) {
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
export const listLessons = /* GraphQL */ `
  query ListLessons(
    $filter: ModelLessonFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLessons(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;
export const getTag = /* GraphQL */ `
  query GetTag($label: String!) {
    getTag(label: $label) {
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
export const listTags = /* GraphQL */ `
  query ListTags(
    $label: String
    $filter: ModelTagFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listTags(
      label: $label
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        label
        lessons {
          nextToken
        }
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
export const getLessonTags = /* GraphQL */ `
  query GetLessonTags($id: ID!) {
    getLessonTags(id: $id) {
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
export const listLessonTags = /* GraphQL */ `
  query ListLessonTags(
    $filter: ModelLessonTagsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLessonTags(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        lessonId
        tagLabel
        lesson {
          id
          title
          description
          content
          owner
          createdAt
          updatedAt
        }
        tag {
          label
          createdAt
          updatedAt
          owner
        }
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
export const lessonTagsByLessonId = /* GraphQL */ `
  query LessonTagsByLessonId(
    $lessonId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelLessonTagsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    lessonTagsByLessonId(
      lessonId: $lessonId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        lessonId
        tagLabel
        lesson {
          id
          title
          description
          content
          owner
          createdAt
          updatedAt
        }
        tag {
          label
          createdAt
          updatedAt
          owner
        }
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
export const lessonTagsByTagLabel = /* GraphQL */ `
  query LessonTagsByTagLabel(
    $tagLabel: String!
    $sortDirection: ModelSortDirection
    $filter: ModelLessonTagsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    lessonTagsByTagLabel(
      tagLabel: $tagLabel
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        lessonId
        tagLabel
        lesson {
          id
          title
          description
          content
          owner
          createdAt
          updatedAt
        }
        tag {
          label
          createdAt
          updatedAt
          owner
        }
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
