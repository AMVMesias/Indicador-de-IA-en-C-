#include<iostream>

int calc(int x, int y, std::string op);

int main()
{
	int a, b, ans;
	std::string Operator;

	while(true)
	{
		std::cin >> a >> Operator >> b;
		
		if(Operator =="?")
		{ 
			break;
		}

		ans = calc(a, b, Operator);

		std::cout << ans << std::endl;
	}

	return 0;
}

int calc(int x, int y, std::string op)
{
	int ans;

	if (op == "+")
	{
		ans = x + y;
	}
	else if (op == "-")
	{
		ans = x - y;
	}
	else if (op == "*")
	{
		ans = x * y;
	}
	else if (op == "/")
	{
		ans = x / y;
	}

	return ans;
}
