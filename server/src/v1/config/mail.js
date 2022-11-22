const Mailgen = require("mailgen");

const auth = {
  user: "taxilenapp@gmail.com",
  password: process.env["EMAIL_PRIVATE_KEY"],
  emailURL: "http://192.168.1.235:4000/",
  siteDomains: {
    verifyEmail: "http://192.168.1.235:4000/api/users/verify-email/",
  },
};

const types = {
  register: {
    subject: {
      en: "Welcome to Taxilen",
      ar: "أهلًا بك في Taxilen",
    },
    emailBody: {
      title: {
        en: (user) => `<br />
        <center text-align="right">
          This is your email verification code which is valid for 10 minutes:
          <br /> 
          ${user.emailVerificationCode.code}
          </center>
         <br />`,

        ar: (user) => `<br />
         <center text-align="right">
           هذا هو الكود الخاص بتفعيل بريدك الإلكتروني صالح لمدة 10 دقائق:
           <br /> 
           ${user.emailVerificationCode.code}
           </center>
          <br />`,
      },
      greeting: {
        en: "Dear",
        ar: "عزيزي",
      },
    },
  },

  forgotPassword: {
    subject: {
      en: "Forgot my password",
      ar: "نسيت كلمة المرور الخاصة بي",
    },
    emailBody: {
      title: {
        en: (user) => `<br />
        <center text-align="right">
          This is your reset password code which is valid for 10 minutes:
          <br /> 
          ${user.resetPasswordCode.code}
          </center>
         <br />`,

        ar: (user) => `<br />
        <center text-align="right">
          هذا هو الكود الخاص باستعادة كلمة المرور صالح لمدة 10 دقائق:
          <br /> 
          ${user.resetPasswordCode.code}
          </center>
         <br />`,
      },
      greeting: {
        en: "Dear",
        ar: "عزيزي",
      },
    },
  },

  changeEmail: {
    subject: {
      en: "Change your email",
      ar: "تغيير بريدك الإلكتروني",
    },
    emailBody: {
      title: {
        en: (user) => `<br />
        <center text-align="right">
          This is your new email verification code which is valid for 10 minutes:
          <br /> 
          ${user.emailVerificationCode.code}
          </center>
         <br />`,

        ar: (user) => `<br />
         <center text-align="right">
           هذا هو الكود الخاص بتفعيل بريدك الإلكتروني الجديد صالح لمدة 10 دقائق:
           <br /> 
           ${user.emailVerificationCode.code}
           </center>
          <br />`,
      },
      greeting: {
        en: "Dear",
        ar: "عزيزي",
      },
    },
  },
};

const getMailGenerator = (lang = "ar") => {
  try {
    const en = {
      theme: "default",
      product: {
        name: "Taxilen",
        link: "#",
        copyright: "© 2022 Taxilen.",
      },
    };

    const ar = {
      theme: "default",
      product: {
        name: "Taxilen",
        link: "#",
        copyright: "© 2022 Taxilen.",
      },
    };

    switch (lang.toLowerCase()) {
      case "en":
        return new Mailgen(en);

      case "ar":
        return new Mailgen(ar);

      default:
        return new Mailgen(ar);
    }
  } catch (err) {
    throw err;
  }
};

const getEmailBody = (mailGenerator, title, greeting, user) => {
  try {
    return mailGenerator.generate({
      body: {
        title,
        greeting,
        signature: user.name,
      },
    });
  } catch (err) {
    throw err;
  }
};

const getMessage = (email, html, subject) => ({
  from: "Taxilen",
  to: email,
  html,
  subject,
});

module.exports = {
  auth,
  getMailGenerator,
  getEmailBody,
  getMessage,
  types,
};
