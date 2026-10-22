#include <iostream>

int main()
{
	int h, w;
	while (true)
	{
		std::cin >> h >> w;
		if (h == 0 && w == 0)break;
		for (int i = 0; i < h; ++i)
		{
			for (int j = 0; j < w; ++j)
			{
				std::cout << "#";
			}
			std::cout << std::endl;
		}
		std::cout << std::endl;
	}
	return 0;
}