// This file is a "Hello, world!" in C++ language by GCC for wandbox.
#include <iostream>
#include <cstdlib>
#include <math.h>
#include <algorithm>
#include <string>

using namespace std;

void hoge(int x, int y)
{
    int counter = 0;
    string str(y, '#');
    while(counter < x) {
        cout << str << endl;
        counter += 1;
    }
    cout << endl;
    counter = 0;
}

int main()
{
    int H, W;
    while(cin >> H >> W, H+W != 0) {
    hoge(H,W);
    }
}


