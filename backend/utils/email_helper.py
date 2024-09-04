from pathlib import Path

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from rest_framework import serializers
from utils.custom_serializer_fields import CustomChoiceField
from partos_pat.settings import EMAIL_FROM, WEBDOMAIN


class EmailTypes:
    user_register = "user_register"

    FieldStr = {
        user_register: "user_register",
    }


class ListEmailTypeRequestSerializer(serializers.Serializer):
    type = CustomChoiceField(
        choices=list(EmailTypes.FieldStr.keys()), required=True
    )


def email_context(context: dict, type: str):
    context.update({
        "logo": f"{WEBDOMAIN}/logo.png"
    })
    if type == EmailTypes.user_register:
        context.update(
            {
                "subject": "Please Verify Your Email Address",
                "body": """
                We're excited to have you on board. Before you can start
                exploring everything we have to offer,
                we need to verify your email address.
                """,
                "cta_instruction": """
                Please click the link below to complete
                your registration and activate your account:
                """,
                "cta_text": "Verify My Email",
                "cta_url": "{0}/api/v1/verify?token={1}".format(
                    WEBDOMAIN,
                    context["verification_token"]
                ),
            }
        )
    return context


def send_email(
    context: dict,
    type: str,
    path=None,
    content_type=None,
    send=True,
):
    context = email_context(context=context, type=type)
    try:

        email_html_message = render_to_string("email/main.html", context)
        msg = EmailMultiAlternatives(
            "PARTOS-PAT - {0}".format(context.get("subject")),
            "Email plain text",
            EMAIL_FROM,
            context.get("send_to"),
        )
        msg.attach_alternative(email_html_message, "text/html")
        if path:
            msg.attach(Path(path).name, open(path).read(), content_type)
        print("send", send)
        if send:
            msg.send()
        if not send:
            return email_html_message
    except Exception as ex:
        print("Error", ex)
        print(ex)
