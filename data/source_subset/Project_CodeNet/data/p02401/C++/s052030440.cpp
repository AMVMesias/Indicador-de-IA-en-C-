#include <iostream>

using namespace std;

int main()
{
	int a = 0, b = 0;
	char op = 0;

	while(true)
	{
		cin >> a >> op >> b;
		if(op == '?'){ break; }
	
		switch (op)
		{
		case '+':
			cout << a + b << endl;
			break;
		case '-':
			cout << a - b << endl;
			break;
		case '*':
			cout << a * b << endl;
			break;
		case '/':
			cout << a / b << endl;
			break;
		}
	}


	return 0;
}