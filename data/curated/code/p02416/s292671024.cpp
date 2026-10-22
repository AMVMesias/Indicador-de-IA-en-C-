
#include <bits/stdc++.h>

using namespace std;


int main(int argc, char *argv[])
{
    
    cin.tie(0), cout.tie(0), ios::sync_with_stdio(false);
    string line;
    int sum = 0;
    
    while (getline(cin, line),line != "0") {
        for (int i = 0; i < line.length(); i++) {
            sum += line[i]-'0';
        }
        cout << sum << endl;
        sum = 0;
    }
    
    return 0;
}

