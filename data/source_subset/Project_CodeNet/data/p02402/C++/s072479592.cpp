#include<iostream>
using namespace std;

int main(int n, int a) {
    cin >> n >> a;
    int min = a;
    int max = a;
    long long sum = a;
    for (int i = 1; i < n; i++) {
        cin >> a;
        if (a < min) {
            min = a;
        }
        else if (a > max) {
            max = a;
        }
        sum += a;
    }
    cout << min << " " << max << " " << sum << endl;
    return 0;
}
