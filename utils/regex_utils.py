import re


def find_email(html):

    match = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", html)

    if match:
        return match.group(0)


def find_instagram(html):

    match = re.search(r"instagram\.com/[A-Za-z0-9_.]+", html)

    if match:
        return "https://" + match.group(0)
