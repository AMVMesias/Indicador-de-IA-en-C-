#include <bits/stdc++.h>
using namespace std;

int main(){
    int  N; cin >> N;
    int M, m;
    long long s;
    s = 0;
    M = -1000006;
    m = 1000006;
    for(int i = 0; i < N ;i++){
        int tmp;
        cin >> tmp;
        if(tmp > M) M = tmp;
        if(tmp < m) m = tmp;
        s += tmp;
    }
    cout << m << " " << M << " " << s << endl;
    return 0;
}
