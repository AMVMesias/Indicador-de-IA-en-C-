#include <iostream>
using namespace std;
int main(){
    int num1,num2;
    char type;
    cin >> num1 >> type >> num2;
    while(type!='?'){
            if(type=='+'){
            cout << num1+num2 << endl;
        }
        else if(type=='-'){
            cout << num1-num2 << endl;
        }
        else if(type=='*'){
            cout << num1*num2 << endl;
        }
        else if(type=='/'){
            cout << num1/num2 << endl;
        }
        cin >> num1 >> type >> num2;
    }
    return 0;
}
