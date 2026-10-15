FORMAT ELF EXECUTABLE
ENTRY mukhya
SEGMENT READABLE EXECUTABLE
mukhya:
	MOV	EAX,4
	MOV	EBX,1
	MOV	ECX,sa_m_daeesha
	MOV	EDX,sa_m_daeesha_SIZE
	INT	0x80
	MOV	EAX,1
	XOR	EBX,EBX
	INT	0x80
SEGMENT READABLE WRITEABLE
sa_m_daeesha DB "सारे जहां से अच्छा हिंदोस्तां हमारा!",0xA
sa_m_daeesha_SIZE = $-sa_m_daeesha
