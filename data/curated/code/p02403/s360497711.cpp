#include<stdio.h>
int main(){
  int n,m,i,j;
  while(1){
    scanf("%d %d",&n,&m);
    if(n==0&&m==0) break;
    for(i=0;i<n;i++){
      for(j=0;j<m;j++){
	printf("#");
      }
      printf("\n");
    }
    printf("\n");
  }
  return(0);
}