#include<iostream>
using namespace std;
#define F(i,s,e) for(int i=s;i<e;++i)

int main(){
    string s;
    while(getline(cin,s) && s[0]!='0'){
        long sum=0;
        F(i,0,s.size()){
            sum+=s[i]-'0';
        }
        cout << sum << endl;
    }
    return 0;
}
