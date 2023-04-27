// eslint-disable-next-line import/prefer-default-export
export const SAMPLE_QUIZ_OBJECT = {
  metadata: {
    header: "Test your knowledge",
    storageKey: "kajhaikaahoijldahadai-wof9q0",
    isGlobal: false
  },
  elements: [
    {
      type: "QUESTION",
      props: {
        title: "What do you think of my Hashnode Quiz widget?",
        answer: "D",
        options: [
          "It's not a big thing",
          "I won't really care about it",
          "~~I love it since you used `webpack`",
          "Whatever"
        ],
        feedBackContent:
          "~~There's absolutely no reason whatsoever to use `webpack`. Come to think of it, if `webpack` was really a good thing, why does a lot of people not like it at all. It just doesn't sense. So, just don't use `yaml` of `js-yaml`.\n"
      }
    },
    {
      type: "CODE_BOARD",
      props: {
        title: "Whatever you think about the following code snippet",
        language: "js",
        content:
          // eslint-disable-next-line quotes
          'function invert(value) {\n  if (typeof value !== "string" || value === "") return 0\n  const highestCharCodeAtValue = 65536\n  const valueLength = value.length\n\n  let invertedValue = ""\n  for (let i = 0; i < valueLength; i++) {\n    const indexToUse = valueLength - 1 - i\n    const charCodeToUse = highestCharCodeAtValue - value.charCodeAt(indexToUse)\n    invertedValue += String.fromCharCode(charCodeToUse)\n  }\n\n  return invertedValue\n}\n'
      }
    },
    {
      type: "QUESTION",
      props: {
        title: "What do you think of my Hashnode Quiz widget?",
        answer: "D",
        options: [
          "It's not a big thing",
          "I won't really care about it",
          "~~I love it since you used `webpack`",
          "Whatever"
        ],
        feedBackContent:
          "~~There's absolutely no reason whatsoever to use `webpack`. Come to think of it, if `webpack` was really a good thing, why does a lot of people not like it at all. It just doesn't sense. So, just don't use `yaml` of `js-yaml`.\n"
      }
    },
    {
      type: "QUESTION",
      props: {
        title: "Do you think I hate food?",
        answer: "D",
        options: [
          "Yes",
          "<>I know for a fact that you don't <b>hate</b>food",
          "~~I love it since you used `webpack`",
          "Whatever"
        ],
        feedBackContent:
          "~~There's absolutely no reason whatsoever to use `webpack`. Come to think of it, if `webpack` was really a good thing, why does a lot of people not like it at all. It just doesn't sense. So, just don't use `yaml` of `js-yaml`.\n"
      }
    }
  ]
}
