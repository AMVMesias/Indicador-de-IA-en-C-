#include <iostream>
#include <vector>
#include <stdio.h>
#include <string>
#include <cctype>

#define rep(i,n) for(int i = 0; i < n; i++)

typedef long long ll;

using namespace std;

const int INF = 1e9;
const double PI=3.14159265358979323846;

int main(){
  while(100){
    string s;
    int ans=0;
    cin >> s;
    if(s=="0") break;
    for(int j=0; j<s.size();j++){
      ans+=s[j]-'0';
    }
    cout << ans << endl;
  }
}

