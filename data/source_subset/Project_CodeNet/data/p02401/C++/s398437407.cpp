#include <iostream>
#include <iomanip>
#include <stdio.h>
using namespace std;

int main()
{
	int a[1000];
	int b[1000];
	int c[1000];
	char op[1000];
	
	int i = 0;
	while(1){
		cin >> a[i] >> op[i] >> b[i];
		
		switch(op[i]){
			case '+':
				c[i] = a[i] + b[i];	break;
			case '-':
				c[i] = a[i] - b[i];	break;
			case '*':
				c[i] = a[i] * b[i];	break;
			case '/':
				c[i] = a[i] / b[i];	break;
		}
		if(op[i] == '?') break;
		i++;
	}
	
	for(i=0; op[i] != '?'; i++)
		cout << c[i] << endl;
	
	return 0;
}

