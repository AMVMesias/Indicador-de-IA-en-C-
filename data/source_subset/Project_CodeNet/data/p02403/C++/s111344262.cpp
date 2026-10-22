#include<stdio.h>
int main(){
    int h,w,a,b=0;
        while(1){
    scanf("%d%d",&h,&w);
        if(h==0&&w==0)break;
    while(h>b){
        while(w>a){
                printf("#");
                a ++;
                    }
        b ++;
        a =0;
        printf("\n");
                }
        b=0;
        printf("\n");
        }

    return 0;
}