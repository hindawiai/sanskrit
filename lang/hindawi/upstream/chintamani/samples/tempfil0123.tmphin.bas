INPUT "ऊँचाई: ", na
PRINT na
FOR ka = 1 TO na
 FOR kha = 1 TO (na - ka)
  PRINT " ";
 NEXT kha
 FOR ga = 1 TO ka
  PRINT "&";
 NEXT ga
 PRINT ""
NEXT ka
FOR ka = (na - 1) TO 1 STEP -1
 FOR kha = 1 TO (na - ka)
  PRINT " ";
 NEXT kha
 FOR ga = 1 TO ka
  PRINT "&";
 NEXT ga
 PRINT ""
NEXT ka
END
