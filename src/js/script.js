class Field {
  constructor(element) {
    if (!new.target) {
      throw new Error("Field must be called with a new operator");
    }
    if (!element) {
      throw new Error("new Field: element is empty");
    }
    this._element = element;
    this._validators = [element => element.validity.valid];

    this._element.addEventListener("input", () => {
      this.valid();
    });

    this._element.addEventListener("change", () => {
      this.valid();
    });
  }

  setRequired() {
    this._validators.unshift(() => this._element.value);
  }

  get value() {
    return this._element.value;
  }

  set value(value) {
    this._element.value = value;
  }

  valid() {
    const isValid = this._validators.every(v => v(this._element));

    this._element.classList.remove("input__field--invalid");
    if (!isValid) {
      this._element.classList.add("input__field--invalid");
    }
    return isValid;
  }

  focus() {
    return this._element.focus();
  }

  addChangeHandler(handler) {
    this._element.addEventListener("change", handler);
  }
}

class Form {
  constructor(element) {
    if (!new.target) {
      throw new Error("Form must be called with a new operator");
    }
    if (!element) {
      throw new Error("new Form: element is empty");
    }
    if (!(element instanceof HTMLFormElement)) {
      throw new Error("new Form: element is not a form element");
    }
    element.noValidate = true;

    this._element = element;
    this._fields = [];
  }

  addFields(...fields) {
    this._fields.push(...fields);
  }

  valid() {
    let valid = true;
    this._fields.forEach(f => (valid &= f.valid()));

    return valid;
  }

  get fields() {
    return this._fields;
  }

  addSubmitHandler(handler) {
    this._element.addEventListener("submit", handler);
  }
}

class Modal {
  constructor(element) {
    if (!new.target) {
      throw new Error("Modal must be called with a new operator");
    }
    this._element = element;

    this._initClose();
  }

  _initClose() {
    const close = this.close.bind(this);

    window.addEventListener("keydown", evt => {
      if (evt.keyCode !== 27) {
        return;
      }
      evt.preventDefault();

      close();
    });

    const closeButton = this._element.querySelector(".popup__close");
    if (closeButton) {
      closeButton.addEventListener("click", evt => {
        evt.preventDefault();

        close();
      });
    }
  }

  open() {
    if (!this._element.classList.contains("popup--closed")) {
      return;
    }
    this._element.classList.remove("popup--closed");
  }

  close() {
    if (this._element.classList.contains("popup--closed")) {
      return;
    }
    this._element.classList.add("popup--closed");
  }

  shake() {
    this._element.style.animationName = "shake";
    this._element.style.animationDuration = "0.6s";

    setTimeout(() => {
      this._element.style.animationName = "";
      this._element.style.animationDuration = "";
    }, 600);
  }
}

const noopStorage = {
  setItem() {},
  getItem() {
    return "";
  }
};

if (!localStorage) {
  localStorage = noopStorage;
}

const nameField = new Field(document.getElementById("feedback__name"));
nameField.setRequired();
nameField.value = localStorage.getItem("name");

const emailField = new Field(document.getElementById("feedback__email"));
emailField.setRequired();
emailField.value = localStorage.getItem("email");

const textField = new Field(document.getElementById("feedback__text"));
textField.setRequired();

const feedbackForm = new Form(document.querySelector(".feedback__form"));
feedbackForm.addFields(nameField, emailField, textField);

const feedbackModalOpenButton = document.querySelector(".contacts__link");
const feedbackModal = new Modal(document.querySelector(".feedback.popup"));

feedbackModalOpenButton.addEventListener("click", evt => {
  evt.preventDefault();

  feedbackModal.open();

  feedbackForm.fields.find(f => !f.value).focus();
});

feedbackForm.addSubmitHandler(evt => {
  if (!feedbackForm.valid()) {
    evt.preventDefault();

    return feedbackModal.shake();
  }
  localStorage.setItem("name", nameField.value);
  localStorage.setItem("email", emailField.value);
});

const mapModal = new Modal(document.querySelector(".map.popup"));
const mapModalOpenButton = document.querySelector(".contacts__map-link");

mapModalOpenButton.addEventListener("click", evt => {
  evt.preventDefault();

  mapModal.open();
});

const addSliderControlsHandlers = (sliderControls, sliderItems) => {
  sliderControls.forEach((control, idx) =>
    control.addEventListener("click", evt => {
      evt.preventDefault();

      sliderItems.forEach(item => item.classList.add("slider__item--closed"));
      sliderControls.forEach(control =>
        control.classList.remove("slider__control--active")
      );

      sliderItems[idx].classList.remove("slider__item--closed");
      control.classList.add("slider__control--active");
    })
  );
};

const promoSliderItems = [...document.querySelectorAll(".promo__item")];
const promoSliderControls = [...document.querySelectorAll(".promo__control")];
addSliderControlsHandlers(promoSliderControls, promoSliderItems);

const serviceSliderItems = [...document.querySelectorAll(".service")];
const serviceSliderControls = [
  ...document.querySelectorAll(".services__control")
];
addSliderControlsHandlers(serviceSliderControls, serviceSliderItems);
