%{
#include <ctype.h>
#include <stdio.h>
#define YYSTYPE double

int yyerror(char *);
int yylex();
%}
 
%token _a_mka
%left '+' '-'
%left '*' '/'
%left '%'
%right ghataa
 
%%
pa_mk_ti   : pa_mk_ti _uk_ti '\n'   { printf("%g \n", $2); }
       | pa_mk_ti '\n'
       | /* _aipasilana */
       ;
_uk_ti   : _uk_ti '+' _uk_ti    { $$ = $1 + $3; }
       | _uk_ti '-' _uk_ti    { $$ = $1 - $3; }
       | _uk_ti '*' _uk_ti    { $$ = $1 * $3; }
       | _uk_ti '/' _uk_ti    { $$ = $1 / $3; }
       | _uk_ti '%' _uk_ti    { $$ = (int)$1 % (int)$3; }
       | '(' _uk_ti ')'     { $$ = $2; }
       | '-' _uk_ti %prec ghataa  { $$ = - $2; }
       | _a_mka
       ;
%%
 
int yylex()
{
   int cha;
   while ( ( cha=getchar() ) == ' ' );
   if ( (cha == '.') || (isdigit(cha)) )
   {
      ungetc(cha, stdin);
      scanf("%lf", &yylval);
      return _a_mka;
   }
   return cha;
}
 
int yyerror()
{
   return 0;
}
 
int main(int _tasa, char *_tawa[] )
{
   printf("हिंदवी कैल्क्यूलेटर\n");
   printf("Copyright (C) 2005 Abhishek Choudhary\n");
   printf("GNU GPL V2 license. NO WARRANTY.\n");
   printf("आप 0 से 9, +, -, *, / और () का प्रयोग कर सकते हैं।\n");
   yyparse();
   return 0;
}
