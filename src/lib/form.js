// eslint-disable-next-line import/prefer-default-export
export function getFormInputValueFromId(form, inputId) {
  return form.querySelector(`#${inputId}`).value
}
