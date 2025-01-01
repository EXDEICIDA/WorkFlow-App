import utility_functions 

while True:
    user_action = input("Type add, show, edit, complete or exit: ")
    user_action = user_action.strip()

    if user_action.startswith("add"):
        todo = user_action[4:]

        todos = utility_functions.get_todos()

        todos.append(todo + '\n')

        utility_functions.write_todos(todos)
    elif user_action.startswith("show"):

        todos = utility_functions.get_todos()

        for index, item in enumerate(todos):
            item = item.strip('\n')
            row = f"{index + 1} - {item}"
            print(row)

    elif user_action.startswith("edit"):
        try:
            number = int(user_action[5:])
            print(number)
            number = number - 1

            todos = utility_functions.get_todos()

            new_todo = input("Enter a new todo: ")
            todos[number] = new_todo + '\n'

            utility_functions.write_todos("tasks.txt", todos)
        except ValueError:
            print("Invalid input")
            continue

    elif user_action.startswith("complete"):
        try:
            number = int(user_action[9:])

            todos = utility_functions.get_todos()
            index = number - 1
            todo_to_remove = todos[index].strip('\n')
            todos.pop(index)

            utility_functions.write_todos("tasks.txt", todos)

            message = f"Task number {number - 1}, {todo_to_remove}, has been completed."
            print(message)
        except IndexError:
            print("There is no task with that number to remove")

    elif user_action.startswith('exit'):
        break

    else:
        print("This command is not valid!")

print("Bye")