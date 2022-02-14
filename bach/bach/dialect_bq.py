def _tokenize(p):
    tokens = []
    token = []

    i = iter(p.strip())
    c = next(i, None)
    while c:
        while c and c not in '<>,':
            token.append(c)
            c = next(i, None)

        # process the token
        t = "".join(token).strip()
        token=[]
        if len(t):
            if ' ' in t:
                tokens.extend(t.split(' '))
            else:
                tokens.append(t)
        if c:
            tokens.append(str(c))
            c = next(i, None)

    return tokens


def _nest(tokens):
    stack = []     # we build a stack of mutable elements, to keep track of where we are in the hierarchy
    current = {}   # we start with a dict, because if there is no nesting at all, we store type only
    name = "root"  # default base element name, removed before we return.

    i = iter(tokens)
    while t := next(i, None):
        if t == ',':
            continue
        elif t == '>':
            current = stack.pop()
            continue
        # elif t not in ('ARRAY', 'STRUCT') and isinstance(current, dict):
        #     name = t
        #     t = next(i)

        if t in ('ARRAY', 'STRUCT'):  # container type
            dbtype = [] if t == 'ARRAY' else {}
            assert(next(i) == '<')
        else:  # single type
            dbtype = t

        if isinstance(current, list):
            current.append(dbtype)
        else:
            current[name] = dbtype

        if not isinstance(dbtype, str):  # new nesting level
            stack.append(current)
            current = dbtype

    return current['root']

def dtype_structure(dtype: str):
    return _nest(_tokenize(dtype))