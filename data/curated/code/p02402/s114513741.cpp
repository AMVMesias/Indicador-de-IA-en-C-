#include<cstdio>

int main(){
    int n,i,a,b,min,max;
    long long sum;
    scanf("%d %d",&n,&a);
    min = a;
    max = a;
    sum = a;
    for(int i = 2;n >= i;i++){
        scanf("%d",&b);
        if(min >= b){
            min = b;
        }
        else{
            min = min;
        }
        if(max <= b){
            max = b;
        }
        else{
            max = max;
        }
        sum = sum + b;
        }
        printf("%d %d %lld\n",min,max,sum);
        return 0;
        
}
