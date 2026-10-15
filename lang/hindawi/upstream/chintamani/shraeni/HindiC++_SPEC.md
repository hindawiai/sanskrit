# HindiC++ Language Specification

## 1. Scope

This document specifies HindiC++, a Hindi lexical form of the C++ programming language.

HindiC++ defines source-level tokens for C++ language constructs, selected preprocessing constructs, selected standard library names, and selected implementation-library names. A HindiC++ program has the same syntactic and semantic structure as the corresponding C++ program obtained by replacing HindiC++ tokens with their specified C++ equivalents.

This document specifies the HindiC++ language, not any particular translator, compiler, editor, shell script, file name, executable name, or build system.

## 2. Normative Relationship To C++

Except where this document explicitly defines a HindiC++ spelling, the syntax and semantics of HindiC++ are those of C++.

A HindiC++ translation unit denotes a C++ translation unit by token equivalence. The meaning of a HindiC++ program is the meaning of that C++ translation unit under the selected C++ language standard and implementation.

If a construct is well-formed in the corresponding C++ translation unit, and all HindiC++ tokens used in it are valid according to this specification, the HindiC++ construct is well-formed.

If a construct is ill-formed in the corresponding C++ translation unit, the HindiC++ construct is ill-formed.

## 3. Terms And Definitions

### 3.1 HindiC++ Token

A HindiC++ token is a source token whose spelling is defined by this specification and which denotes a C++ token, keyword, operator, punctuator, preprocessing token, macro name, type name, library name, or implementation-library name.

### 3.2 Token Equivalence

Token equivalence is the normative mapping from a HindiC++ token to its C++ token.

### 3.3 Corresponding C++ Translation Unit

The corresponding C++ translation unit of a HindiC++ translation unit is the sequence of C++ tokens obtained after applying token equivalence to all HindiC++ tokens while preserving literals, whitespace separation, comments, and non-reserved identifiers.

### 3.4 Reserved HindiC++ Token

A reserved HindiC++ token is a HindiC++ spelling defined by this specification. A reserved HindiC++ token shall not be used as an identifier unless its corresponding C++ token may be used as an identifier in the same syntactic context.

## 4. Conformance

### 4.1 Conforming Program

A conforming HindiC++ program shall:

1. Be a sequence of HindiC++ preprocessing tokens and source tokens.
2. Use only HindiC++ reserved tokens in contexts where their corresponding C++ tokens are valid.
3. Have a corresponding C++ translation unit that is well-formed according to the selected C++ language standard.

### 4.2 Conforming Implementation

A conforming HindiC++ implementation shall:

1. Recognize every HindiC++ token defined by this specification.
2. Preserve character literals and string literals.
3. Preserve identifiers that are not reserved HindiC++ tokens.
4. Diagnose failure to form a valid corresponding C++ translation unit, or pass through diagnostics from the C++ implementation used to determine validity.

## 5. Source Files And Translation Units

A HindiC++ source file contains zero or more declarations, preprocessing directives, comments, and tokens.

A HindiC++ translation unit is formed from a HindiC++ source file after preprocessing-token recognition and token equivalence.

The optional style marker:

```text
<शैली श्रेणी>
```

identifies a source file as HindiC++. If present, it is not part of the corresponding C++ translation unit.

## 6. Lexical Elements

### 6.1 Character Set

HindiC++ source text may contain Devanagari characters, ASCII characters, digits, whitespace, and implementation-supported source characters.

### 6.2 Whitespace

Whitespace separates tokens as in C++. Whitespace has no semantic effect except where C++ assigns it significance, including preprocessing directives, literals, and token separation.

### 6.3 Comments

C++ comment forms are permitted:

```text
// comment
/* comment */
```

Comments are not subject to HindiC++ token equivalence.

### 6.4 Literals

Character literals and string literals are preserved. HindiC++ reserved tokens appearing inside literals shall not be recognized as HindiC++ tokens.

Escape sequence aliases are recognized outside the literal-preservation rule only where tokenization permits them:

| HindiC++ | C++ |
| --- | --- |
| `\च` | `\a` |
| `\म` | `\b` |
| `\प` | `\f` |
| `\न` | `\n` |
| `\ल` | `\r` |
| `\ट` | `\t` |
| `\ख` | `\v` |
| `\ष` | `\x` |

### 6.5 Identifiers

An identifier that is not a reserved HindiC++ token denotes the same identifier in the corresponding C++ translation unit.

The validity, linkage, name lookup, overloading, storage duration, and lifetime of identifiers are governed by C++.

## 7. Token Equivalence

### 7.1 General Rule

Each HindiC++ token in this section denotes the C++ token shown in the same row.

Where a HindiC++ token has multiple spellings, each spelling denotes the same C++ token.

### 7.2 Fundamental Keywords

| HindiC++ | C++ |
| --- | --- |
| `मुख्य` | `main` |
| `व्योम` | `void` |
| `अक्षर` | `char` |
| `लघु` | `short` |
| `पूर्णांक` | `int` |
| `दीर्घ` | `long` |
| `भग्न` | `float` |
| `द्विगुन` | `double` |
| `चिन्हित` | `signed` |
| `अचिन्हित` | `unsigned` |
| `स्वतः` | `auto` |
| `रेजिस्टर` | `register` |
| `अटल` | `static` |
| `बाह्य` | `extern` |
| `स्थिर` | `const` |
| `अस्थिर` | `volatile` |
| `प्रकार` | `typedef` |
| `माप` | `sizeof` |

### 7.3 Compound Types

| HindiC++ | C++ |
| --- | --- |
| `काष्ठा` | `struct` |
| `जोड़` | `union` |
| `क्रमागत` | `enum` |
| `श्रेणी` | `class` |
| `ढाँचा` | `template` |

### 7.4 Class And Object Tokens

| HindiC++ | C++ |
| --- | --- |
| `खुला` | `public` |
| `निजी` | `private` |
| `रक्षित` | `protected` |
| `मित्र` | `friend` |
| `भव` | `virtual` |
| `अंतरभूत` | `inline` |
| `यह` | `this` |
| `नया` | `new` |
| `मिटाओ` | `delete` |
| `चालक` | `operator` |

### 7.5 Statement Tokens

| HindiC++ | C++ |
| --- | --- |
| `अगर` | `if` |
| `अन्यथा` | `else` |
| `चयन` | `switch` |
| `हाल` | `case` |
| `शेष` | `default` |
| `क्रम` | `for` |
| `जबतक` | `while` |
| `करो` | `do` |
| `अवरोध` | `break` |
| `जारी` | `continue` |
| `जाओ` | `goto` |
| `वापस` | `return` |
| `प्रयास` | `try` |
| `पकड़ो` | `catch` |
| `फेंको` | `throw` |

### 7.6 Punctuators And Delimiters

| HindiC++ | C++ |
| --- | --- |
| `अणु` | `{` |
| `पूर्ण` | `}` |
| `orictxt361` | `[` |
| `orictxt376` | `]` |
| `orictxt40` | `::` |

### 7.7 Operators

| HindiC++ | C++ |
| --- | --- |
| `orictxt1` | `!` |
| `orictxt2` | `!=` |
| `orictxt21` | `%` |
| `orictxt22` | `%=` |
| `orictxt23` | `&` |
| `orictxt24` | `&&` |
| `orictxt25` | `&=` |
| `orictxt26` | `*` |
| `orictxt27` | `*=` |
| `orictxt28` | `+` |
| `orictxt29` | `++` |
| `orictxt30` | `+=` |
| `orictxt31` | `-` |
| `orictxt32` | `--` |
| `orictxt33` | `-=` |
| `orictxt34` | `->` |
| `orictxt35` | `->*` |
| `orictxt36` | `.` |
| `orictxt37` | `.*` |
| `orictxt38` | `/` |
| `orictxt39` | `/=` |
| `orictxt41` | `<` |
| `orictxt42` | `<<` |
| `orictxt43` | `<<=` |
| `orictxt44` | `>` |
| `orictxt45` | `>>` |
| `orictxt46` | `>>=` |
| `orictxt47` | `?:` |
| `orictxt832` | `|=` |
| `orictxt833` | `||` |
| `orictxt835` | `~` |

## 8. Preprocessing

HindiC++ preprocessing directives are equivalent to C++ preprocessing directives.

| HindiC++ | C++ |
| --- | --- |
| `#समावेश` | `#include` |
| `#घोषणा` | `#define` |
| `#अगर` | `#if` |
| `#अगर_घोषित` | `#ifdef` |
| `#अगर_अघोषित` | `#ifndef` |
| `#या_अगर` | `#elif` |
| `#अन्यथा` | `#else` |
| `#पूर्ण_अगर` | `#endif` |
| `#त्रुटि` | `#error` |
| `#पंक्ति` | `#line` |
| `#आशय` | `#pragma` |
| `#अघोषित` | `#undef` |

Preprocessing expression evaluation, macro expansion, inclusion, conditional inclusion, and diagnostics are governed by C++ after token equivalence.

## 9. Declarations

HindiC++ declarations are C++ declarations after token equivalence.

Examples of declarations include:

```text
पूर्णांक संख्या;
व्योम क्रिया();
श्रेणी नाम अणु पूर्ण;
```

These denote, respectively, C++ declarations using `int`, `void`, and `class`.

## 10. Classes

A HindiC++ class declaration is a C++ class declaration after token equivalence.

Access control, base classes, member lookup, virtual dispatch, construction, destruction, templates, overload resolution, and object lifetime are governed by C++.

Example:

```text
श्रेणी आधार
अणु
खुला:
    भव व्योम लिखो();
पूर्ण;
```

## 11. Functions

HindiC++ function declarations and definitions are C++ function declarations and definitions after token equivalence.

The HindiC++ token `मुख्य` denotes the program entry-point name `main`.

Example:

```text
पूर्णांक मुख्य()
अणु
    वापस 0;
पूर्ण
```

## 12. Statements

HindiC++ statements are C++ statements after token equivalence.

Example:

```text
अगर (x)
अणु
    वापस 1;
पूर्ण
अन्यथा
अणु
    वापस 0;
पूर्ण
```

## 13. Expressions

HindiC++ expressions are C++ expressions after token equivalence.

Operator precedence, associativity, conversions, overload resolution, value categories, temporary object lifetime, constant expression rules, and undefined behavior are governed by C++.

## 14. Exceptions

HindiC++ exception handling is C++ exception handling after token equivalence.

| HindiC++ | C++ |
| --- | --- |
| `प्रयास` | `try` |
| `पकड़ो` | `catch` |
| `फेंको` | `throw` |

## 15. Standard Library Name Equivalence

HindiC++ defines aliases for selected C and C++ library names. These aliases denote the corresponding C++ identifiers. Their declarations, overload sets, namespace membership, side effects, preconditions, postconditions, and error behavior are those of the C++ implementation.

Representative aliases:

| HindiC++ | C++ |
| --- | --- |
| `म_लिखो` | `printf` |
| `म_पूछो` | `scanf` |
| `ख_खोलो` | `fopen` |
| `ख_बंद` | `fclose` |
| `म_माप` | `strlen` |
| `म_नकल` | `strcpy` |
| `म_भेद` | `strcmp` |
| `दो_स्मृति` | `malloc` |
| `मुक्त` | `free` |
| `वर्ग_मूल` | `sqrt` |
| `घात` | `pow` |
| `अ_बाहर` | `cout` |
| `अ_अंदर` | `cin` |
| `अ_त्रुटि` | `cerr` |
| `प_पूर्ण` | `endl` |

## 16. Header Name Equivalence

Selected HindiC++ header names denote C and C++ header names.

| HindiC++ | C++ |
| --- | --- |
| `मानकपन.स` | `stdio.h` |
| `मानककोष.स` | `stdlib.h` |
| `माला.स` | `string.h` |
| `गणित.स` | `math.h` |
| `मानकघोष.स` | `stddef.h` |
| `मानकतर्क.स` | `stdarg.h` |
| `संकेत.स` | `signal.h` |
| `समय.स` | `time.h` |
| `पनप्रवाह.स` | `iostream.h` |
| `पन_प्रवाह` | `iostream` |
| `खप्रवाह.स` | `fstream.h` |
| `मप्रवाह.स` | `strstream.h` |
| `मप्रवाह_स` | `sstream` |

Header availability is governed by the C++ implementation.

## 17. Predefined Macro Name Equivalence

| HindiC++ | C++ |
| --- | --- |
| `__दिन__` | `__DATE__` |
| `__खाता__` | `__FILE__` |
| `__पंक्ति__` | `__LINE__` |
| `__मानक__` | `__STDC__` |
| `__समय__` | `__TIME__` |

## 18. Diagnostics

A HindiC++ implementation shall issue a diagnostic, directly or through the corresponding C++ implementation, for any source file that fails to produce a well-formed corresponding C++ translation unit.

No diagnostic is required for a program whose corresponding C++ translation unit has undefined behavior.

## 19. Undefined, Unspecified, And Implementation-Defined Behavior

Undefined behavior, unspecified behavior, and implementation-defined behavior in HindiC++ are exactly those of the corresponding C++ program, plus any behavior explicitly left to the implementation by this specification.

This specification leaves the following to the implementation:

1. The selected C++ language version.
2. The accepted source character set and encoding.
3. Whether non-ASCII identifiers are accepted by the corresponding C++ implementation.
4. Which non-standard or legacy headers and library names are available.

## 20. Non-Normative Example

```text
<शैली श्रेणी>
#समावेश <मानकपन.स>

श्रेणी उदाहरण
अणु
खुला:
    भव व्योम लिखो()
    अणु
        म_लिखो("नमस्ते\n");
    पूर्ण
पूर्ण;

पूर्णांक मुख्य()
अणु
    उदाहरण उ;
    उ.लिखो();
    वापस 0;
पूर्ण
```

The example denotes a C++ program containing a class, a virtual member function, a local object, a member call, and a `main` function returning `0`.
