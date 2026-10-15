# Sanchalan Suktam, how the 22 verses are parsed

These 22 lines are not parsed by additional Paninian rules. No new sutra was added for this text. The parser does four things, in order.

1. Source. The file is read as text. The title line is kept. Blank lines are kept.
2. Verse split. A verse ends at `॥n॥`. The marker is removed from the verse body. The title is attached to verse 1.
3. Lexical scan. The body is walked left to right. At each position the longest lexicon term that matches is taken. `श्च` is a special case, licensed by 8.3.34 then 8.4.40. Unmatched text becomes a residual span.
4. Lowering. Each matched term has a role and an operation code. Those codes are written into the generated C. The C calls the library. The library counts some of them. It does not derive the Sanskrit.

Residual on this source is 0 because every remaining span was added to the closed lexicon as `residual` / `deferred`. That is recognition. It is not sandhi-viccheda, not morphology, and not chanda.

## Stages for all 22

### Verse 1

Source body: `||SanchalanSuktam||अधिकारश्चमूलेवैस्मृतिप्रमाणसिद्धयेस्थानपट्टंसमाप्येवकार्यमारभतेस्थिरम्`

Status: LEXICALLY_COMPLETE. Residual: ``.

Lexical nodes:

- `||SanchalanSuktam||` → role `residual`, operation `deferred`, rule `SUK-003`
- `अधिकार` → role `control`, operation `scope`, rule `SUK-003`
- `श्च` → role `sandhi`, operation `visarga-ca`, rule `SUK-007`
- `च` → role `particle`, operation `particle`, rule `SUK-003`
- `मूले` → role `runtime`, operation `root`, rule `SUK-003`
- `वै` → role `particle`, operation `particle`, rule `SUK-003`
- `स्मृतिप्रमाण` → role `memory-proof`, operation `validate-memory`, rule `SUK-003`
- `सिद्धये` → role `memory-proof`, operation `validate`, rule `SUK-003`
- `स्थानपट्ट` → role `storage`, operation `address-board`, rule `SUK-003`
- `ं` → role `residual`, operation `deferred`, rule `SUK-003`
- `समाप्य` → role `control`, operation `complete`, rule `SUK-003`
- `ेव` → role `residual`, operation `deferred`, rule `SUK-003`
- `कार्य` → role `runtime`, operation `work`, rule `SUK-003`
- `मारभते` → role `residual`, operation `deferred`, rule `SUK-003`
- `स्थिरम्` → role `runtime`, operation `state`, rule `SUK-003`

Operation codes passed to the library: `deferred,scope,visarga-ca,particle,root,particle,validate-memory,validate,address-board,deferred,complete,deferred,work,deferred,state`

### Verse 2

Source body: `स्रोतस्स्थानात्तुनिर्गत्यगन्तव्यंसङ्ग्यलक्षितम्आनीयसर्वमेवैवंस्थापयेत्क्रमतःस्मृतौ`

Status: LEXICALLY_COMPLETE. Residual: ``.

Lexical nodes:

- `स्रोतस्स्थान` → role `io`, operation `source-location`, rule `SUK-003`
- `ात्` → role `residual`, operation `deferred`, rule `SUK-003`
- `तु` → role `particle`, operation `particle`, rule `SUK-003`
- `निर्गत्य` → role `control`, operation `exit`, rule `SUK-003`
- `गन्तव्य` → role `control`, operation `destination`, rule `SUK-003`
- `ं` → role `residual`, operation `deferred`, rule `SUK-003`
- `सङ्ग्यलक्षितम्` → role `control`, operation `index`, rule `SUK-003`
- `आनीय` → role `control`, operation `bring`, rule `SUK-003`
- `सर्वमे` → role `residual`, operation `deferred`, rule `SUK-003`
- `वै` → role `particle`, operation `particle`, rule `SUK-003`
- `वं` → role `residual`, operation `deferred`, rule `SUK-003`
- `स्थापयेत्` → role `control`, operation `store`, rule `SUK-003`
- `क्रमतः` → role `control`, operation `ordered`, rule `SUK-003`
- `स्मृतौ` → role `memory`, operation `memory-reference`, rule `SUK-003`

Operation codes passed to the library: `source-location,deferred,particle,exit,destination,deferred,index,bring,deferred,particle,deferred,store,ordered,memory-reference`

### Verse 3

Source body: `रिक्तस्थानंतुसर्वत्रशून्येनैवप्रपूरयेत्शुद्धिंकृत्वाचतस्यैवमङ्गलंकुरुतेध्रुवम्`

Status: LEXICALLY_COMPLETE. Residual: ``.

Lexical nodes:

- `रिक्तस्थान` → role `storage`, operation `empty-location`, rule `SUK-003`
- `ं` → role `residual`, operation `deferred`, rule `SUK-003`
- `तु` → role `particle`, operation `particle`, rule `SUK-003`
- `सर्वत्र` → role `control`, operation `everywhere`, rule `SUK-003`
- `शून्येन` → role `memory`, operation `zero-fill`, rule `SUK-003`
- `ैव` → role `residual`, operation `deferred`, rule `SUK-003`
- `प्रपूरयेत्` → role `memory`, operation `fill`, rule `SUK-003`
- `शुद्धिं` → role `diagnostic`, operation `sanitize`, rule `SUK-003`
- `कृत्वा` → role `control`, operation `having-done`, rule `SUK-003`
- `च` → role `particle`, operation `particle`, rule `SUK-003`
- `तस्य` → role `particle`, operation `its`, rule `SUK-003`
- `ैव` → role `residual`, operation `deferred`, rule `SUK-003`
- `मङ्गल` → role `control`, operation `initialize`, rule `SUK-003`
- `ं` → role `residual`, operation `deferred`, rule `SUK-003`
- `कुरुते` → role `runtime`, operation `does`, rule `SUK-003`
- `ध्रुवम्` → role `runtime`, operation `certain`, rule `SUK-003`

Operation codes passed to the library: `empty-location,deferred,particle,everywhere,zero-fill,deferred,fill,sanitize,having-done,particle,its,deferred,initialize,deferred,does,certain`

### Verse 4

Source body: `यन्त्रपट्टेषुसर्वेषुस्थितिकार्यंप्रकल्पयेत्नियन्त्रणन्तुविध्यस्थंरक्षेद्विधिपूर्वकम्`

Status: LEXICALLY_COMPLETE. Residual: ``.

Lexical nodes:

- `यन्त्रपट्ट` → role `runtime`, operation `machine-board`, rule `SUK-003`
- `ेषु` → role `residual`, operation `deferred`, rule `SUK-003`
- `सर्वेषु` → role `control`, operation `in-all`, rule `SUK-003`
- `स्थिति` → role `runtime`, operation `state`, rule `SUK-003`
- `कार्यं` → role `runtime`, operation `work`, rule `SUK-003`
- `प्रकल्पयेत्` → role `runtime`, operation `configure`, rule `SUK-003`
- `नियन्त्रण` → role `control`, operation `control`, rule `SUK-003`
- `न्` → role `residual`, operation `deferred`, rule `SUK-003`
- `तु` → role `particle`, operation `particle`, rule `SUK-003`
- `विध्यस्थं` → role `control`, operation `rule-bound`, rule `SUK-003`
- `रक्षेद्` → role `runtime`, operation `protect`, rule `SUK-003`
- `विधिपूर्वकम्` → role `control`, operation `ordered-procedure`, rule `SUK-003`

Operation codes passed to the library: `machine-board,deferred,in-all,state,work,configure,control,deferred,particle,rule-bound,protect,ordered-procedure`

### Verse 5

Source body: `मूलस्थानेचगन्तव्यंप्रस्थानञ्चविधायचआरभ्यतैवमुख्यञ्चकार्यंसंपूर्णतामियात्`

Status: LEXICALLY_COMPLETE. Residual: ``.

Lexical nodes:

- `मूलस्थान` → role `runtime`, operation `root-location`, rule `SUK-003`
- `े` → role `residual`, operation `deferred`, rule `SUK-003`
- `च` → role `particle`, operation `particle`, rule `SUK-003`
- `गन्तव्य` → role `control`, operation `destination`, rule `SUK-003`
- `ं` → role `residual`, operation `deferred`, rule `SUK-003`
- `प्रस्थान` → role `control`, operation `start`, rule `SUK-003`
- `ञ्` → role `residual`, operation `deferred`, rule `SUK-003`
- `च` → role `particle`, operation `particle`, rule `SUK-003`
- `विधाय` → role `control`, operation `ordain`, rule `SUK-003`
- `च` → role `particle`, operation `particle`, rule `SUK-003`
- `आरभ्य` → role `control`, operation `begin`, rule `SUK-003`
- `तैव` → role `residual`, operation `deferred`, rule `SUK-003`
- `मुख्य` → role `control`, operation `main`, rule `SUK-003`
- `ञ्` → role `residual`, operation `deferred`, rule `SUK-003`
- `च` → role `particle`, operation `particle`, rule `SUK-003`
- `कार्यं` → role `runtime`, operation `work`, rule `SUK-003`
- `संपूर्णता` → role `control`, operation `completion`, rule `SUK-003`
- `मियात्` → role `control`, operation `should-go`, rule `SUK-003`

Operation codes passed to the library: `root-location,deferred,particle,destination,deferred,start,deferred,particle,ordain,particle,begin,deferred,main,deferred,particle,work,completion,should-go`

### Verse 6

Source body: `अधिकारश्चमूलेवैद्वारपट्टेंसमाश्रित्यसञ्चारंकारयेत्सम्यक्लेखनायविधीयते`

Status: LEXICALLY_COMPLETE. Residual: ``.

Lexical nodes:

- `अधिकार` → role `control`, operation `scope`, rule `SUK-003`
- `श्च` → role `sandhi`, operation `visarga-ca`, rule `SUK-007`
- `च` → role `particle`, operation `particle`, rule `SUK-003`
- `मूले` → role `runtime`, operation `root`, rule `SUK-003`
- `वै` → role `particle`, operation `particle`, rule `SUK-003`
- `द्वारपट्ट` → role `ipc`, operation `door-board`, rule `SUK-003`
- `ें` → role `residual`, operation `deferred`, rule `SUK-003`
- `समाश्रित्य` → role `control`, operation `depend`, rule `SUK-003`
- `सञ्चारं` → role `ipc`, operation `communicate`, rule `SUK-003`
- `कारयेत्` → role `control`, operation `cause`, rule `SUK-003`
- `सम्यक्` → role `control`, operation `properly`, rule `SUK-003`
- `लेखनाय` → role `io`, operation `write`, rule `SUK-003`
- `विधीयते` → role `control`, operation `is-ordained`, rule `SUK-003`

Operation codes passed to the library: `scope,visarga-ca,particle,root,particle,door-board,deferred,depend,communicate,cause,properly,write,is-ordained`

### Verse 7

Source body: `हृत्स्थानेवैपरिच्छिद्यसञ्चारकंविधानतःप्रेषयेत्प्रत्यक्षरंनित्यंविराममवलोकयन्`

Status: LEXICALLY_COMPLETE. Residual: ``.

Lexical nodes:

- `हृत्स्थान` → role `runtime`, operation `core-location`, rule `SUK-003`
- `ेव` → role `residual`, operation `deferred`, rule `SUK-003`
- `ै` → role `residual`, operation `deferred`, rule `SUK-003`
- `परिच्छिद्य` → role `control`, operation `bound`, rule `SUK-003`
- `सञ्चारक` → role `ipc`, operation `communicator`, rule `SUK-003`
- `ं` → role `residual`, operation `deferred`, rule `SUK-003`
- `विधानतः` → role `control`, operation `by-rule`, rule `SUK-003`
- `प्रेषयेत्` → role `ipc`, operation `send`, rule `SUK-003`
- `प्रत्यक्षर` → role `io`, operation `per-character`, rule `SUK-003`
- `ं` → role `residual`, operation `deferred`, rule `SUK-003`
- `नित्यं` → role `control`, operation `always`, rule `SUK-003`
- `विराम` → role `control`, operation `pause`, rule `SUK-003`
- `मवलोकयन्` → role `residual`, operation `deferred`, rule `SUK-003`

Operation codes passed to the library: `core-location,deferred,deferred,bound,communicator,deferred,by-rule,send,per-character,deferred,always,pause,deferred`

### Verse 8

Source body: `यावत्प्रेषणपट्टेवैस्थानंभवतिपूरितम्तावत्प्रतीक्षणंकृत्वासङ्केतम्प्रेषयेत्ततः`

Status: LEXICALLY_COMPLETE. Residual: ``.

Lexical nodes:

- `यावत्` → role `control`, operation `while`, rule `SUK-003`
- `प्रेषणपट्ट` → role `ipc`, operation `send-buffer`, rule `SUK-003`
- `ेव` → role `residual`, operation `deferred`, rule `SUK-003`
- `ै` → role `residual`, operation `deferred`, rule `SUK-003`
- `स्थानं` → role `storage`, operation `location`, rule `SUK-003`
- `भवति` → role `runtime`, operation `is`, rule `SUK-003`
- `पूरितम्` → role `storage`, operation `filled`, rule `SUK-003`
- `तावत्` → role `control`, operation `until`, rule `SUK-003`
- `प्रतीक्षण` → role `process`, operation `wait`, rule `SUK-003`
- `ं` → role `residual`, operation `deferred`, rule `SUK-003`
- `कृत्वा` → role `control`, operation `having-done`, rule `SUK-003`
- `सङ्केत` → role `ipc`, operation `signal`, rule `SUK-003`
- `म्` → role `residual`, operation `deferred`, rule `SUK-003`
- `प्रेषयेत्` → role `ipc`, operation `send`, rule `SUK-003`
- `ततः` → role `control`, operation `then`, rule `SUK-003`

Operation codes passed to the library: `while,send-buffer,deferred,deferred,location,is,filled,until,wait,deferred,having-done,signal,deferred,send,then`

### Verse 9

Source body: `अक्षराणिचसर्वाणिसन्देशस्यक्रमेणैवद्वारपट्टेप्रपूर्यैवकार्यंपूर्णंसमापयेत्`

Status: LEXICALLY_COMPLETE. Residual: ``.

Lexical nodes:

- `अक्षराणि` → role `io`, operation `characters`, rule `SUK-003`
- `च` → role `particle`, operation `particle`, rule `SUK-003`
- `सर्वाणि` → role `control`, operation `all-items`, rule `SUK-003`
- `सन्देश` → role `ipc`, operation `message`, rule `SUK-003`
- `स्य` → role `residual`, operation `deferred`, rule `SUK-003`
- `क्रमेण` → role `control`, operation `ordered`, rule `SUK-003`
- `ैव` → role `residual`, operation `deferred`, rule `SUK-003`
- `द्वारपट्ट` → role `ipc`, operation `door-board`, rule `SUK-003`
- `े` → role `residual`, operation `deferred`, rule `SUK-003`
- `प्रपूर्य` → role `memory`, operation `fill`, rule `SUK-003`
- `ैव` → role `residual`, operation `deferred`, rule `SUK-003`
- `कार्यं` → role `runtime`, operation `work`, rule `SUK-003`
- `पूर्णं` → role `control`, operation `complete`, rule `SUK-003`
- `समापयेत्` → role `control`, operation `complete`, rule `SUK-003`

Operation codes passed to the library: `characters,particle,all-items,message,deferred,ordered,deferred,door-board,deferred,fill,deferred,work,complete,complete`

### Verse 10

Source body: `अधिकारश्चमूलेवैप्रथमप्रक्रियाश्रयेपिड्शून्यंनित्यमुत्पाद्यस्थितिंश्रेष्ठांप्रकल्पयेत्`

Status: LEXICALLY_COMPLETE. Residual: ``.

Lexical nodes:

- `अधिकार` → role `control`, operation `scope`, rule `SUK-003`
- `श्च` → role `sandhi`, operation `visarga-ca`, rule `SUK-007`
- `च` → role `particle`, operation `particle`, rule `SUK-003`
- `मूले` → role `runtime`, operation `root`, rule `SUK-003`
- `वै` → role `particle`, operation `particle`, rule `SUK-003`
- `प्रथमप्रक्रिया` → role `process`, operation `first-process`, rule `SUK-003`
- `श्रये` → role `residual`, operation `deferred`, rule `SUK-003`
- `पिड्शून्य` → role `process`, operation `pid-zero`, rule `SUK-003`
- `ंनित्यमुत्पाद्य` → role `residual`, operation `deferred`, rule `SUK-003`
- `स्थितिं` → role `runtime`, operation `state`, rule `SUK-003`
- `श्रेष्ठां` → role `control`, operation `best`, rule `SUK-003`
- `प्रकल्पयेत्` → role `runtime`, operation `configure`, rule `SUK-003`

Operation codes passed to the library: `scope,visarga-ca,particle,root,particle,first-process,deferred,pid-zero,deferred,state,best,configure`

### Verse 11

Source body: `स्मृतिस्थानंविभज्यादौविस्तारंचैवसर्वतःकार्यपट्टान्समुद्दिश्यसूचकान्स्थापयेत्क्रमात्`

Status: LEXICALLY_COMPLETE. Residual: ``.

Lexical nodes:

- `स्मृतिस्थान` → role `memory`, operation `partition-memory`, rule `SUK-003`
- `ं` → role `residual`, operation `deferred`, rule `SUK-003`
- `विभज्य` → role `memory`, operation `partition`, rule `SUK-003`
- `ादौ` → role `residual`, operation `deferred`, rule `SUK-003`
- `विस्तारं` → role `memory`, operation `extent`, rule `SUK-003`
- `च` → role `particle`, operation `particle`, rule `SUK-003`
- `ैव` → role `residual`, operation `deferred`, rule `SUK-003`
- `सर्वतः` → role `control`, operation `from-all`, rule `SUK-003`
- `कार्यपट्ट` → role `runtime`, operation `work-board`, rule `SUK-003`
- `ान्` → role `residual`, operation `deferred`, rule `SUK-003`
- `समुद्दिश्य` → role `control`, operation `indicate`, rule `SUK-003`
- `सूचक` → role `data`, operation `index`, rule `SUK-003`
- `ान्` → role `residual`, operation `deferred`, rule `SUK-003`
- `स्थापयेत्` → role `control`, operation `store`, rule `SUK-003`
- `क्रमात्` → role `control`, operation `ordered`, rule `SUK-003`

Operation codes passed to the library: `partition-memory,deferred,partition,deferred,extent,particle,deferred,from-all,work-board,deferred,indicate,index,deferred,store,ordered`

### Verse 12

Source body: `सर्वप्रक्रियामूलत्वेस्थापयित्वात्विमंनृपंयन्त्ररक्षणकार्येषुसदैवाग्रणिमन्महे`

Status: LEXICALLY_COMPLETE. Residual: ``.

Lexical nodes:

- `सर्व` → role `residual`, operation `deferred`, rule `SUK-003`
- `प्रक्रिया` → role `process`, operation `process`, rule `SUK-003`
- `मूल` → role `runtime`, operation `root`, rule `SUK-003`
- `त्वे` → role `residual`, operation `deferred`, rule `SUK-003`
- `स्थापयित्वा` → role `control`, operation `place`, rule `SUK-003`
- `त्विमं` → role `residual`, operation `deferred`, rule `SUK-003`
- `नृपं` → role `runtime`, operation `initialize-runtime`, rule `SUK-003`
- `यन्त्ररक्षण` → role `runtime`, operation `protect-machine`, rule `SUK-003`
- `कार्य` → role `runtime`, operation `work`, rule `SUK-003`
- `ेषुसदैवाग्रणिमन्महे` → role `residual`, operation `deferred`, rule `SUK-003`

Operation codes passed to the library: `deferred,process,root,deferred,place,deferred,initialize-runtime,protect-machine,work,deferred`

### Verse 13

Source body: `अनाथप्रक्रियाश्चैवमृताःसञ्जातसंशयःस्वेकेनापिड्शून्येनसंरक्ष्यैवप्रमोचये`

Status: LEXICALLY_COMPLETE. Residual: ``.

Lexical nodes:

- `अनाथप्रक्रिया` → role `process`, operation `orphan-process`, rule `SUK-003`
- `श्च` → role `sandhi`, operation `visarga-ca`, rule `SUK-007`
- `च` → role `particle`, operation `particle`, rule `SUK-003`
- `ैव` → role `residual`, operation `deferred`, rule `SUK-003`
- `मृताः` → role `process`, operation `terminated`, rule `SUK-003`
- `सञ्जात` → role `diagnostic`, operation `arisen`, rule `SUK-003`
- `संशयः` → role `diagnostic`, operation `doubt`, rule `SUK-003`
- `स्वेकेन` → role `process`, operation `by-own`, rule `SUK-003`
- `ा` → role `residual`, operation `deferred`, rule `SUK-003`
- `पिड्शून्य` → role `process`, operation `pid-zero`, rule `SUK-003`
- `ेन` → role `residual`, operation `deferred`, rule `SUK-003`
- `संरक्ष्य` → role `runtime`, operation `protect`, rule `SUK-003`
- `ैव` → role `residual`, operation `deferred`, rule `SUK-003`
- `प्रमोचये` → role `process`, operation `release`, rule `SUK-003`

Operation codes passed to the library: `orphan-process,visarga-ca,particle,deferred,terminated,arisen,doubt,by-own,deferred,pid-zero,deferred,protect,deferred,release`

### Verse 14

Source body: `यावद्यन्त्रंसदाजीवत्तावज्जागरूकःस्थितिविनष्टप्रक्रियाश्चैवशोधयित्वाविशाम्यति`

Status: LEXICALLY_COMPLETE. Residual: ``.

Lexical nodes:

- `यावद्` → role `control`, operation `while`, rule `SUK-003`
- `यन्त्र` → role `runtime`, operation `machine`, rule `SUK-003`
- `ं` → role `residual`, operation `deferred`, rule `SUK-003`
- `सदा` → role `control`, operation `always`, rule `SUK-003`
- `जीवत्` → role `process`, operation `living`, rule `SUK-003`
- `तावज्` → role `control`, operation `until`, rule `SUK-003`
- `जागरूक` → role `runtime`, operation `watchdog`, rule `SUK-003`
- `ः` → role `residual`, operation `deferred`, rule `SUK-003`
- `स्थिति` → role `runtime`, operation `state`, rule `SUK-003`
- `विनष्ट` → role `diagnostic`, operation `destroyed`, rule `SUK-003`
- `प्रक्रिया` → role `process`, operation `process`, rule `SUK-003`
- `श्च` → role `sandhi`, operation `visarga-ca`, rule `SUK-007`
- `च` → role `particle`, operation `particle`, rule `SUK-003`
- `ैव` → role `residual`, operation `deferred`, rule `SUK-003`
- `शोधयित्वा` → role `diagnostic`, operation `sanitize`, rule `SUK-003`
- `विशाम्यति` → role `control`, operation `rest`, rule `SUK-003`

Operation codes passed to the library: `while,machine,deferred,always,living,until,watchdog,deferred,state,destroyed,process,visarga-ca,particle,deferred,sanitize,rest`

### Verse 15

Source body: `अधिकारश्चमूलेवैट्रैपपट्टंनिसर्गेणप्रसाध्यैवव्यतिक्रमविशोधने`

Status: LEXICALLY_COMPLETE. Residual: ``.

Lexical nodes:

- `अधिकार` → role `control`, operation `scope`, rule `SUK-003`
- `श्च` → role `sandhi`, operation `visarga-ca`, rule `SUK-007`
- `च` → role `particle`, operation `particle`, rule `SUK-003`
- `मूले` → role `runtime`, operation `root`, rule `SUK-003`
- `वै` → role `particle`, operation `particle`, rule `SUK-003`
- `ट्रैपपट्ट` → role `runtime`, operation `trap-board`, rule `SUK-003`
- `ं` → role `residual`, operation `deferred`, rule `SUK-003`
- `निसर्गेण` → role `runtime`, operation `native`, rule `SUK-003`
- `प्रसाध्य` → role `control`, operation `accomplish`, rule `SUK-003`
- `ैव` → role `residual`, operation `deferred`, rule `SUK-003`
- `व्यतिक्रम` → role `diagnostic`, operation `violation`, rule `SUK-003`
- `विशोधने` → role `diagnostic`, operation `validate`, rule `SUK-003`

Operation codes passed to the library: `scope,visarga-ca,particle,root,particle,trap-board,deferred,native,accomplish,deferred,violation,validate`

### Verse 16

Source body: `पृष्ठपट्टंसमुत्पाद्यस्मृतिरक्षणमुत्तमंप्रचाल्यवैवर्चुवल्मेमरीमन्तरायतः`

Status: LEXICALLY_COMPLETE. Residual: ``.

Lexical nodes:

- `पृष्ठपट्ट` → role `memory`, operation `page-board`, rule `SUK-003`
- `ं` → role `residual`, operation `deferred`, rule `SUK-003`
- `समुत्पाद्य` → role `control`, operation `produce`, rule `SUK-003`
- `स्मृतिरक्षण` → role `memory`, operation `protect-memory`, rule `SUK-003`
- `मुत्तमं` → role `residual`, operation `deferred`, rule `SUK-003`
- `प्रचाल्य` → role `runtime`, operation `run`, rule `SUK-003`
- `वै` → role `particle`, operation `particle`, rule `SUK-003`
- `वर्चुवल्मेमरी` → role `memory`, operation `virtual-memory`, rule `SUK-003`
- `मन्तरायतः` → role `residual`, operation `deferred`, rule `SUK-003`

Operation codes passed to the library: `page-board,deferred,produce,protect-memory,deferred,run,particle,virtual-memory,deferred`

### Verse 17

Source body: `पिड्प्रथमंसमुत्पाद्यस्मृतिस्थानंप्रदायचयुसर्मोडंसमाविश्यप्रक्रियाम्प्रारभेद्वै`

Status: LEXICALLY_COMPLETE. Residual: ``.

Lexical nodes:

- `पिड्` → role `process`, operation `process-id`, rule `SUK-003`
- `प्रथमं` → role `process`, operation `first`, rule `SUK-003`
- `समुत्पाद्य` → role `control`, operation `produce`, rule `SUK-003`
- `स्मृतिस्थान` → role `memory`, operation `partition-memory`, rule `SUK-003`
- `ं` → role `residual`, operation `deferred`, rule `SUK-003`
- `प्रदाय` → role `control`, operation `give`, rule `SUK-003`
- `च` → role `particle`, operation `particle`, rule `SUK-003`
- `युसर्मोड` → role `runtime`, operation `user-mode`, rule `SUK-003`
- `ं` → role `residual`, operation `deferred`, rule `SUK-003`
- `समाविश्य` → role `runtime`, operation `enter`, rule `SUK-003`
- `प्रक्रिया` → role `process`, operation `process`, rule `SUK-003`
- `म्` → role `residual`, operation `deferred`, rule `SUK-003`
- `प्रारभेद्` → role `control`, operation `begin`, rule `SUK-003`
- `वै` → role `particle`, operation `particle`, rule `SUK-003`

Operation codes passed to the library: `process-id,first,produce,partition-memory,deferred,give,particle,user-mode,deferred,enter,process,deferred,begin,particle`

### Verse 18

Source body: `टर्मिनल्स्थानमासाद्यमुद्रयित्वानिदेशकम्प्रवेषार्थंसुसन्नद्धंप्रश्नसूच्यम्प्रकाशयेत्`

Status: LEXICALLY_COMPLETE. Residual: ``.

Lexical nodes:

- `टर्मिनल्` → role `io`, operation `terminal`, rule `SUK-003`
- `स्थानमासाद्य` → role `residual`, operation `deferred`, rule `SUK-003`
- `मुद्रयित्वा` → role `io`, operation `print`, rule `SUK-003`
- `निदेशक` → role `control`, operation `director`, rule `SUK-003`
- `म्` → role `residual`, operation `deferred`, rule `SUK-003`
- `प्रवेष` → role `runtime`, operation `enter`, rule `SUK-003`
- `ार्थं` → role `residual`, operation `deferred`, rule `SUK-003`
- `सुसन्नद्धं` → role `runtime`, operation `ready`, rule `SUK-003`
- `प्रश्नसूच्य` → role `io`, operation `prompt`, rule `SUK-003`
- `म्` → role `residual`, operation `deferred`, rule `SUK-003`
- `प्रकाशयेत्` → role `io`, operation `display`, rule `SUK-003`

Operation codes passed to the library: `terminal,deferred,print,director,deferred,enter,deferred,ready,prompt,deferred,display`

### Verse 19

Source body: `अधिकारश्चमूलेवैआदेशगृहसंस्थाप्यमूलादेशसमूहनंविधीयते`

Status: LEXICALLY_COMPLETE. Residual: ``.

Lexical nodes:

- `अधिकार` → role `control`, operation `scope`, rule `SUK-003`
- `श्च` → role `sandhi`, operation `visarga-ca`, rule `SUK-007`
- `च` → role `particle`, operation `particle`, rule `SUK-003`
- `मूले` → role `runtime`, operation `root`, rule `SUK-003`
- `वै` → role `particle`, operation `particle`, rule `SUK-003`
- `आदेशगृह` → role `command`, operation `command-store`, rule `SUK-003`
- `संस्थाप्य` → role `control`, operation `establish`, rule `SUK-003`
- `मूलादेश` → role `command`, operation `root-command`, rule `SUK-003`
- `समूह` → role `data`, operation `group`, rule `SUK-003`
- `नं` → role `residual`, operation `deferred`, rule `SUK-003`
- `विधीयते` → role `control`, operation `is-ordained`, rule `SUK-003`

Operation codes passed to the library: `scope,visarga-ca,particle,root,particle,command-store,establish,root-command,group,deferred,is-ordained`

### Verse 20

Source body: `इन्पुट्स्थानमसौज्ञात्वापाठयित्वानिरन्तरंप्रक्रियाद्वन्द्वमुत्पाद्यसञ्चारंपारयेत्ततः`

Status: LEXICALLY_COMPLETE. Residual: ``.

Lexical nodes:

- `इन्पुट्स्थान` → role `io`, operation `input-location`, rule `SUK-003`
- `मसौ` → role `residual`, operation `deferred`, rule `SUK-003`
- `ज्ञात्वा` → role `control`, operation `know`, rule `SUK-003`
- `पाठयित्वा` → role `io`, operation `read`, rule `SUK-003`
- `निरन्तरं` → role `control`, operation `continuous`, rule `SUK-003`
- `प्रक्रियाद्वन्द्व` → role `process`, operation `spawn-pair`, rule `SUK-003`
- `मुत्पाद्य` → role `residual`, operation `deferred`, rule `SUK-003`
- `सञ्चारं` → role `ipc`, operation `communicate`, rule `SUK-003`
- `पारयेत्ततः` → role `ipc`, operation `forward`, rule `SUK-003`

Operation codes passed to the library: `input-location,deferred,know,read,continuous,spawn-pair,deferred,communicate,forward`

### Verse 21

Source body: `पाठ्यशोधनकार्याणिस्मृतिमानंनिवेशनंप्रत्येकमप्यादेशञ्चप्रथक्कृत्वाप्रचालयेत्`

Status: LEXICALLY_COMPLETE. Residual: ``.

Lexical nodes:

- `पाठ्यशोधन` → role `diagnostic`, operation `sanitize-text`, rule `SUK-003`
- `कार्य` → role `runtime`, operation `work`, rule `SUK-003`
- `ाणि` → role `residual`, operation `deferred`, rule `SUK-003`
- `स्मृतिमान` → role `memory`, operation `measure-memory`, rule `SUK-003`
- `ं` → role `residual`, operation `deferred`, rule `SUK-003`
- `निवेशनं` → role `io`, operation `input`, rule `SUK-003`
- `प्रत्येकमप्यादेशञ्` → role `residual`, operation `deferred`, rule `SUK-003`
- `च` → role `particle`, operation `particle`, rule `SUK-003`
- `प्रथक्कृत्वा` → role `control`, operation `separate`, rule `SUK-003`
- `प्रचालयेत्` → role `runtime`, operation `run`, rule `SUK-003`

Operation codes passed to the library: `sanitize-text,work,deferred,measure-memory,deferred,input,deferred,particle,separate,run`

### Verse 22

Source body: `आदेशपाइप्मार्गेणफलंस्थानसमूहनम्अग्रिमप्रक्रियास्थानेप्रेषयित्वाविशाम्यति`

Status: LEXICALLY_COMPLETE. Residual: ``.

Lexical nodes:

- `आदेशपाइप` → role `ipc`, operation `command-pipe`, rule `SUK-003`
- `्` → role `residual`, operation `deferred`, rule `SUK-003`
- `मार्गेण` → role `ipc`, operation `path`, rule `SUK-003`
- `फलं` → role `runtime`, operation `result`, rule `SUK-003`
- `स्थान` → role `residual`, operation `deferred`, rule `SUK-003`
- `समूह` → role `data`, operation `group`, rule `SUK-003`
- `नम्` → role `residual`, operation `deferred`, rule `SUK-003`
- `अग्रिम` → role `process`, operation `next`, rule `SUK-003`
- `प्रक्रिया` → role `process`, operation `process`, rule `SUK-003`
- `स्थाने` → role `storage`, operation `location`, rule `SUK-003`
- `प्रेषय` → role `ipc`, operation `send`, rule `SUK-003`
- `ित्वा` → role `residual`, operation `deferred`, rule `SUK-003`
- `विशाम्यति` → role `control`, operation `rest`, rule `SUK-003`

Operation codes passed to the library: `command-pipe,deferred,path,result,deferred,group,deferred,next,process,location,send,deferred,rest`

## One shloka, in detail: verse 18

Source:

`टर्मिनल्स्थानमासाद्यमुद्रयित्वानिदेशकम्प्रवेषार्थंसुसन्नद्धंप्रश्नसूच्यम्प्रकाशयेत्॥१८॥`

This is the first-prompt verse. It says: having reached the terminal place, having printed the director, ready for entry, display the question-indicator.

What the parser actually did:

- `टर्मिनल्` matched as `terminal`, role `io`, operation `terminal`.
- `स्थानमासाद्य` matched as `span-30`, role `residual`, operation `deferred`.
- `मुद्रयित्वा` matched as `mudrayitva`, role `io`, operation `print`.
- `निदेशक` matched as `nidesaka`, role `control`, operation `director`.
- `म्` matched as `span-15`, role `residual`, operation `deferred`.
- `प्रवेष` matched as `pravesa`, role `runtime`, operation `enter`.
- `ार्थं` matched as `span-31`, role `residual`, operation `deferred`.
- `सुसन्नद्धं` matched as `susannaddha`, role `runtime`, operation `ready`.
- `प्रश्नसूच्य` matched as `prasna-suci`, role `io`, operation `prompt`.
- `म्` matched as `span-15`, role `residual`, operation `deferred`.
- `प्रकाशयेत्` matched as `prakasayet`, role `io`, operation `display`.

What it did not do: it did not resolve the case endings, it did not undo the sandhi that joins `स्थानम्` to `आसाद्य`, and it did not build a clause. `स्थानमासाद्य` is one deferred span. `म्` and `ार्थं` and another `म्` are deferred fragments. The technical words `टर्मिनल्स्थान`, `मुद्रयित्वा`, `निदेशकम्`, `सुसन्नद्धं`, and `प्रकाशयेत्` were recognized because they are in the closed lexicon.

The first-prompt kernel in `lang/suktam/kernel/` is the runtime reading of this verse: reach a console, print a login line, accept one name, print a prompt. It is not a derivation of the shloka.
