import re
import random
import string
from typing import Callable, List, Union


def generate_acronym(name: str) -> str:
    words = re.split(r'[\s-]+', name)
    if len(words) > 1:
        acronym = ''.join([word[0].upper() for word in words if word])
    else:
        acronym = name[0].upper() + name[-1].upper()
    return acronym


def generate_random_string(length):
    letters = string.ascii_lowercase
    return "".join(random.choice(letters) for i in range(length))


def clean_array_param(param: str, func: Callable) -> List[int]:
    array = [func(p) for p in param.split(",")]
    return [it for it in array if it]


def maybe_int(val) -> Union[int, None]:
    try:
        return int(val)
    except Exception:
        return None
