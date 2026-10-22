#include<iostream>
using namespace std;
int main(){
int a,b;
cin>>a>>b;
while(a!=0 and b!=0){
for(int c=0;c<a;c++){
for(int d=0;d<b;d++){
cout<<'#';
}
cout<<endl;
}
cout<<endl;
cin>>a>>b;
}
return 0;
}
