from pathlib import Path

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from rest_framework import serializers
from utils.custom_serializer_fields import CustomChoiceField
from partos_pat.settings import EMAIL_FROM, WEBDOMAIN


class EmailTypes:
    user_register = "user_register"
    forgot_password = "forgot_password"
    session_created = "session_created"

    FieldStr = {
        user_register: "user_register",
        forgot_password: "forgot_password",
        session_created: "session_created",
    }


class ListEmailTypeRequestSerializer(serializers.Serializer):
    type = CustomChoiceField(
        choices=list(EmailTypes.FieldStr.keys()), required=True
    )


def email_context(context: dict, type: str):
    context.update({"logo": f"{WEBDOMAIN}/logo.png"})
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
                    WEBDOMAIN, context["verification_code"]
                ),
            }
        )
    if type == EmailTypes.forgot_password:
        context.update(
            {
                "subject": "Reset Your Password",
                "body": """
                We received a password reset request for
                the Partos Power Awareness tool for your account
                If you did not make the request, please ignore this email.
                Otherwise, you can reset your password using the link below:
                """,
                "cta_instruction": """
                Please click the link below to reset your password:
                """,
                "cta_text": "Reset My Password",
                "cta_url": "{0}/en/reset-password?token={1}".format(
                    WEBDOMAIN, context["reset_password_code"]
                ),
            }
        )
    if type == EmailTypes.session_created:
        context.update(
            {
                "subject": "PAT Session created",
                "body": """
                We are pleased to inform you that
                a new PAT Session has been successfully created
                with the following details:\n
                Name of the Partnership: {0}\n
                Date: {1}\n
                Invite Code: {2}\n
                """.format(
                    context["session_name"],
                    context["date"],
                    context["join_code"]
                ),
                "cta_instruction": """
                Please share this email with your desired participants.
                They can join the session by using the invite code and
                clicking the "Join" button in the PAT system.
                """,
                "cta_text": "Join",
                "cta_url": WEBDOMAIN,
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
