#include <bits/stdc++.h>
using namespace std;

int main(){
    
    while(1){
       int a,b;
       string op;
       cin >> a >> op >>b;
       if ( op == "?") break;
       

       int ans;
       if ( op == "+") ans = a+b;
       if ( op == "-") ans=a-b;
       if ( op == "*") ans = a*b;
       if ( op == "/") ans = a/b;

       cout << ans <<endl;

       }
}
