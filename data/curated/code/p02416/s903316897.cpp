#include "bits/stdc++.h"
using namespace std;

int main() {
string s;
int sum=0;
while(1){
cin>>s;
if(s=="0"){
return 0;
}
for (int i = 0; i < s.length(); ++i) {
	sum+=s[i]-'0';
}
cout<<sum<<endl;
sum=0;
}
}